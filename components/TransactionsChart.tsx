import { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import Color from "color"

import { Box, Paper, Typography } from "@mui/material"

import { getCategoryIcon } from "../lib/categories";
import { useBreakPoints } from "../lib/hooks";
import { PurchaseDetails, CategoryDetails } from "../models";

type TransactionsChartProps = {
  title?: string,
  data: PurchaseDetails[],
  categories: CategoryDetails[],
  verticalAlign?: "top" | "middle" | "bottom",
  horizontalAlign?: "left" | "center" | "right"
  layout?: "horizontal" | "vertical",
  position?: string,
}

const TransactionsChart = ({ title, data, categories, verticalAlign="top", horizontalAlign="center", layout="horizontal" }: TransactionsChartProps) => {

  const { mdScreen } = useBreakPoints()

  const chartData = categories.map(({icon, label}) => {
    const amount = data.filter((item) => getCategoryIcon(categories, item.category) === icon).reduce((prev, curr) => prev + curr.amount, 0)
    return {icon, category: label, amount}
  }).filter(({ amount }) => amount > 0)

  const noOfColors = chartData.length
  const frequency = 5/noOfColors;
  let colors: string[] = []

  for (let i = 0; i < noOfColors; ++i){
      const r = Math.floor(Math.sin(frequency*i + 0) * (127) + 128).toString(16).padStart(2,'0');
      const g = Math.floor(Math.sin(frequency*i + 2) * (127) + 128).toString(16).padStart(2,'0');
      const b = Math.floor(Math.sin(frequency*i + 4) * (127) + 128).toString(16).padStart(2,'0');
      
      const hex = `#${r}${g}${b}`
      const color = Color(hex).darken(0.25).desaturate(0.2).hex()
      colors.push(color)
  }

  const [activeIndex, setActiveIndex] = useState(0)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return(
    <Box sx={{position: 'relative', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
      {title && (<Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>)}
      <Paper sx={{ flex: 1, p: 2, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} elevation={0}>
        <Box sx={{ width: '100%' }}>
          {chartData.length === 0 ? ( 
            <Typography component="p" variant="body2" textAlign="center">
              No purchases available.
            </Typography>
          ): (
            <ResponsiveContainer width="100%" aspect={ mdScreen ? 16/9 : 1.25 }>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  fill="#4ca2cd"
                  dataKey="amount"
                  onMouseEnter={onPieEnter}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign={verticalAlign} align={horizontalAlign} layout={layout}
                  payload={chartData.map(({ icon, category, amount}, i) => ({ value: `${icon} ${category} ($${amount.toFixed(2)})`, type: 'rect', color: colors[i] }))}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>
    </Box>
    
  )
}

export default TransactionsChart

const RADIAN = Math.PI / 180;

const renderActiveShape = ({ cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value }: {
  cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, fill: string, payload: any, percent: number, value: number
}) => {
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {`${payload.icon} ${payload.category}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#333">
        {`$${value.toFixed(2)} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }: {
  cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number, payload: any
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {payload.icon} {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};