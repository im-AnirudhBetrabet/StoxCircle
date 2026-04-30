import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot, Area, } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { supabase } from '../lib/supabase';
import ChartLoader from "./loaders/ChartLoader";

const normalizeDate = (date) =>
  new Date(date).toISOString().split("T")[0];

const findClosestPoint = (data, targetDate) => {
  if (!data || data.length === 0) return null;

  const target = new Date(targetDate).getTime();

  return data.reduce((closest, item) => {
    const current = new Date(item.date).getTime();
    const closestTime = new Date(closest.date).getTime();

    return Math.abs(current - target) < Math.abs(closestTime - target)
      ? item
      : closest;
  });
};

export default function PerformanceChart({ buyPrice, buyDate, ticker, sellDate, sellPrice }) {
  const [hoverData, setHoverData] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [loading  , setLoading  ] = useState(false);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.error("No session found");
          return;
        }

        const params = new URLSearchParams({
          ticker,
          buy_price    : buyPrice,
          iso_from_date: buyDate,
        });
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/stock/info?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStockData(data.data);
        } else {
          console.error("Failed to fetch stock history");
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [ticker, buyPrice, buyDate]);
  
  const enrichedData = useMemo(() => { 
    return stockData.map((d) => {
      const price = Number(d.price);
      return {
        ...d,
        date: normalizeDate(d.date),
        price,
      };
    });
  }, [stockData, buyPrice]);

  // Normalize buy date
  const normalizedBuyDate  = normalizeDate(buyDate);
  const normalizedSellDate = normalizeDate(sellDate)

  // Ensure buy point exists
  const buyPoint = useMemo(() => {
    return findClosestPoint(enrichedData, normalizedBuyDate);
  }, [enrichedData, normalizedBuyDate]);

  const sellPoint = useMemo(() => {
    return findClosestPoint(enrichedData, normalizedSellDate)
  }, [enrichedData, normalizedSellDate])

  if(loading) return <ChartLoader />
  return (
    <div style={{ height: '200px', width: '100%', marginBottom: '24px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} onMouseMove={(state) => { 
            if (state?.activePayload?.length) {
              setHoverData(state.activePayload[0].payload);
            }
          }}
          onMouseLeave={() => setHoverData(null)}
        >

          {/* Axes */}
          <XAxis dataKey="date" hide={true}/>
          <YAxis stroke="#8b8b93" fontSize={12} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
          <Area type="monotone" dataKey="price" baseValue={buyPrice} stroke="none" fill="url(#pnlGradient)" isAnimationActive={false} />
          {/* Tooltip */}
          <Tooltip contentStyle={{ backgroundColor: "#101014", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} formatter={(value) => [`₹${value}`, "Price"]} />
          

          {/* Buy Price Line */}
          <ReferenceLine y={buyPrice} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />

          {/* Hover Line */}
          {hoverData && ( <ReferenceLine x={hoverData.date} stroke="#8884d8" strokeDasharray="3 3" /> )}

          {/* Hover PnL */}
          {hoverData && ( <ReferenceDot x={hoverData.date} y={hoverData.price} r={4} fill="#fff" stroke="#3b82f6" strokeWidth={2} label={{ value: `₹${(hoverData.price - buyPrice).toFixed(2)}`, position: "top", fill: "#fff", fontSize: 12, }} /> )}

          {/* Buy Arrow */}
          <ReferenceDot x={buyPoint?.date} y={buyPrice} r={0} shape={({ cx, cy }) => ( 
              <g>
                <line x1={cx} y1={cy - 25} x2={cx} y2={cy - 5} stroke="#f59e0b"  strokeWidth={2} />
                <polygon points={`${cx - 5},${cy - 5} ${cx + 5},${cy - 5} ${cx},${cy}`} fill="#f59e0b" />
                <text x={cx} y={cy - 30} textAnchor="middle" fill="#f59e0b" fontSize={12}>
                  Bought here
                </text>
              </g>
            )}
          />

          {
            sellDate && 
            (
              <ReferenceDot x={sellPoint?.date} y={sellPrice} r={0} shape={({ cx, cy }) => ( 
                <g>
                  <line x1={cx} y1={cy - 25} x2={cx} y2={cy - 5} stroke="#f59e0b"  strokeWidth={2} />
                  <polygon points={`${cx - 5},${cy - 5} ${cx + 5},${cy - 5} ${cx},${cy}`} fill="#f59e0b" />
                  <text x={cx} y={cy - 30} textAnchor="middle" fill="#f59e0b" fontSize={12}>
                    Sold here
                  </text>
                </g>
              )}
            />
            )
          }

          {/* Price Line */}
          
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
        </LineChart>
        
      </ResponsiveContainer>
    </div>
  );
}