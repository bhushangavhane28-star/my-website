'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    // Table,
    // TableBody,
    // TableCell,
    // TableHead,
    // TableRow,
    // TablePagination,
    // Chip,
    Button,
    // TextField,
    // InputAdornment,
    Tooltip,
    // ToggleButton,
    // ToggleButtonGroup,
} from '@mui/material'
import {
    Download as DownloadIcon,
    // Search as SearchIcon,
    InfoOutlined as InfoIcon,
    AccountBalanceWallet as WalletIcon,
    Receipt as ReceiptIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip as ChartTooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useAuthStore } from '@/stores/authStore'
import { useSocketStore } from '@/stores/socketStore'
import { useMarketStore, type PnlBreakdown } from '@/stores/marketStore'
import { useAppStore } from '@/stores/appStore'
import { getOpenPositions, getClosedPositions } from '@/lib/api/trades'
import { getTradingStatus } from '@/lib/api/trading'
import { useBrokerLTP } from '@/hooks/useBrokerLTP'


ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip)


type TradingMode = 'live' | 'paper'
type ActionFilter = 'ALL' | 'BUY' | 'SELL'
type TradeAction = 'BUY' | 'SELL'
type TradeStatus = 'Open' | 'Closed' | 'Partial'

interface Trade {
    id: string
    symbol: string
    subLabel: string
    action: TradeAction
    qty: number
    avgPrice: number
    ltp: number
    status: TradeStatus
    timestamp?: string
    paperTrading?: boolean
    instrumentToken?: number
    realizedPnl?: number
}


const LIVE_CHARGES = 0

const TYPOGRAPHY_SCALE = {
    sectionTitle: '1rem',
    controls: '0.8125rem',
    metricLabel: '0.75rem',
    metricValue: '1.5rem',
    // tableHeader: '0.75rem',
    // tableBody: '0.8125rem',
    // subText: '0.72rem',
    // chip: '0.65rem',
} as const

// const STATUS_COLORS: Record<TradeStatus, string> = {
//     Open: 'primary.main',
//     Closed: 'text.disabled',
//     Partial: 'warning.main',
// }


const formatINR = (val: number): string =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(val)


const calcPnl = (trade: Trade): number => {
    if (trade.status === 'Closed' && trade.realizedPnl != null) return trade.realizedPnl
    return trade.action === 'BUY'
        ? (trade.ltp - trade.avgPrice) * trade.qty
        : (trade.avgPrice - trade.ltp) * trade.qty
}

const calcRealizedPnl = (trades: Trade[]): number =>
    trades
        .filter(t => t.status === 'Closed')
        .reduce((sum, t) => sum + calcPnl(t), 0)


const calcUnrealizedPnl = (trades: Trade[]): number =>
    trades
        .filter(t => t.status === 'Open' || t.status === 'Partial')
        .reduce((sum, t) => sum + calcPnl(t), 0)

const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return fallback
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const buildMonthlyPnlData = (trades: Trade[]) => {
    const now = new Date()
    const year = now.getFullYear()

    const monthlyPnl = new Array<number>(12).fill(0)

    trades
        .filter((trade) => trade.status === 'Closed')
        .forEach((trade) => {
            if (!trade.timestamp) return
            const parsed = new Date(trade.timestamp)
            if (Number.isNaN(parsed.getTime())) return
            if (parsed.getFullYear() !== year) return

            monthlyPnl[parsed.getMonth()] += calcPnl(trade)
        })

    return {
        labels: MONTH_LABELS,
        data: monthlyPnl.map(v => Number(v.toFixed(2))),
    }
}


const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx: { raw: unknown }) => `P&L: ${formatINR(Number(ctx.raw))}`,
            },
        },
    },
    scales: {
        y: {
            suggestedMin: -1000,
            suggestedMax: 1000,
            ticks: {
                callback: (value: number | string) => `₹${Number(value) / 1000}k`,
                color: '#94a3b8',
            },
            grid: { color: 'rgba(255,255,255,0.05)' },
        },
        x: {
            ticks: { color: '#94a3b8' },
            grid: { display: false },
        },
    },
} as const

// const TABLE_HEADER_CELL_SX = {
//     fontSize: TYPOGRAPHY_SCALE.tableHeader,
//     fontWeight: 600,
//     color: 'text.secondary',
//     py: 1,
// } as const

// const TABLE_BODY_CELL_SX = {
//     fontSize: TYPOGRAPHY_SCALE.tableBody,
//     py: 1,
// } as const


interface MetricCardProps {
    icon: React.ReactNode
    label: string
    tooltip: string
    value: number
    colorOverride?: string
}

function MetricCard({ icon, label, tooltip, value, colorOverride }: MetricCardProps) {
    const finalColor = colorOverride ?? (value < 0 ? '#E24B4A' : '#1D9E75');

    return (
        <Card variant="outlined" sx={{ borderRadius: '12px', bgcolor: 'background.paper' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                    <Box sx={{ color: finalColor, display: 'flex' }}>{icon}</Box>
                    <Typography
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: TYPOGRAPHY_SCALE.metricLabel }}
                    >
                        {label}
                        <Tooltip title={tooltip}>
                            <InfoIcon sx={{ fontSize: 14, cursor: 'help' }} />
                        </Tooltip>
                    </Typography>
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: TYPOGRAPHY_SCALE.metricValue,
                        lineHeight: 1.2,
                        fontWeight: 700, // Font weight changed to 700
                        color: finalColor // Color applied here
                    }}
                >
                    {formatINR(value)}
                </Typography>
            </CardContent>
        </Card>
    )
}


interface PnlBreakdownCardsProps {
    breakdown: PnlBreakdown | null
}

// function PnlBreakdownCards({ breakdown }: PnlBreakdownCardsProps) {
//     if (!breakdown) return null

//     const rows: { label: string; value: number; tooltip: string; hide?: boolean }[] = [
//         {
//             label: 'Intraday (Day)',
//             value: breakdown.intraday_day_pnl,
//             tooltip: 'P&L from positions traded today (day positions)',
//         },
//         {
//             label: 'Carry-forward M2M',
//             value: breakdown.carry_forward_m2m_pnl,
//             tooltip: 'Mark-to-market P&L from overnight / carry-forward positions',
//             hide: breakdown.carry_forward_positions_count === 0 && breakdown.carry_forward_m2m_pnl === 0,
//         },
//         {
//             label: 'Paper Trading',
//             value: breakdown.paper_trading_pnl,
//             tooltip: 'P&L from simulated paper trading positions',
//         },
//         {
//             label: 'Total P&L',
//             value: breakdown.total_pnl,
//             tooltip: 'Combined total: intraday + carry-forward + paper',
//         },
//     ]

//     return (
//         <Grid container spacing={2} sx={{ mb: 2 }}>
//             {rows.map((row) => {
//                 if (row.hide) return null
//                 const color = row.value >= 0 ? 'success.main' : 'error.main'
//                 const isTotal = row.label === 'Total P&L'
//                 return (
//                     <Grid key={row.label} size={{ xs: 6, md: 3 }}>
//                         <Card
//                             variant="outlined"
//                             sx={{
//                                 borderRadius: '12px',
//                                 bgcolor: 'background.paper',
//                                 ...(isTotal ? { borderColor: 'primary.main', borderWidth: 2 } : {}),
//                             }}
//                         >
//                             <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
//                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: 'text.secondary' }}>
//                                     <Typography
//                                         variant="body2"
//                                         sx={{ fontSize: TYPOGRAPHY_SCALE.metricLabel, display: 'flex', alignItems: 'center', gap: 0.5 }}
//                                     >
//                                         {row.label}
//                                         <Tooltip title={row.tooltip}>
//                                             <InfoIcon sx={{ fontSize: 13, cursor: 'help' }} />
//                                         </Tooltip>
//                                     </Typography>
//                                 </Box>
//                                 <Typography
//                                     variant="h6"
//                                     fontWeight={isTotal ? 700 : 600}
//                                     color={color}
//                                     sx={{ fontSize: isTotal ? '1.25rem' : '1.1rem', lineHeight: 1.2 }}
//                                 >
//                                     {formatINR(row.value)}
//                                 </Typography>
//                             </CardContent>
//                         </Card>
//                     </Grid>
//                 )
//             })}
//         </Grid>
//     )
// }


export function PnLCard() {
    const { token } = useAuthStore((s) => ({ token: s.token }))
    const selectedBroker = useSocketStore((s) => s.selectedBroker)
    const wsPnlBreakdown = useMarketStore((s) => s.pnlBreakdown)
    const [restPnlBreakdown, setRestPnlBreakdown] = useState<PnlBreakdown | null>(null)
    const pnlBreakdown = wsPnlBreakdown ?? restPnlBreakdown
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAction, setFilterAction] = useState<ActionFilter>('ALL')
    const [page, setPage] = useState(0)
    // const [rowsPerPage, setRowsPerPage] = useState(5)
    const [liveTrades, setLiveTrades] = useState<Trade[]>([])
    const [paperTrades, setPaperTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const paperTradingEnabled = useAppStore((s) => s.paperTradingEnabled)
    const mode: TradingMode = paperTradingEnabled ? 'paper' : 'live'

    const rawTrades = mode === 'live' ? liveTrades : paperTrades

    const openTradesForBroker = useMemo(
        () => rawTrades.filter(t => t.status === 'Open' || t.status === 'Partial').map(t => ({ instrument_token: t.instrumentToken ?? null })),
        [rawTrades],
    )
    const { ltpMap: kiteLtpMap } = useBrokerLTP(openTradesForBroker)

    const trades = useMemo(() => {
        const hasOpen = rawTrades.some(t => t.status === 'Open' || t.status === 'Partial')
        if (!hasOpen) return rawTrades
        return rawTrades.map((t) => {
            if (t.status === 'Closed' || t.instrumentToken == null) return t
            const kiteLTP = kiteLtpMap[t.instrumentToken]
            if (kiteLTP == null) return t
            const livePnl = t.action === 'BUY'
                ? (kiteLTP - t.avgPrice) * t.qty
                : (t.avgPrice - kiteLTP) * t.qty
            return { ...t, ltp: kiteLTP, pnl: livePnl }
        })
    }, [rawTrades, kiteLtpMap])

    const fetchPnLTrades = useCallback(async () => {
        if (!token) {
            setLiveTrades([])
            setPaperTrades([])
            setLoading(false)
            return
        }

        setLoading(true)
        const broker =
            selectedBroker && !selectedBroker.startsWith('config_') && !selectedBroker.startsWith('connect_')
                ? selectedBroker
                : undefined

        try {
            const [openResult, closedResult] = await Promise.allSettled([
                getOpenPositions(token, broker),
                getClosedPositions(token, 100, broker),
            ])

            const openPositions = openResult.status === 'fulfilled'
                ? (openResult.value.positions ?? []) as Record<string, unknown>[]
                : []
            const closedPositions = closedResult.status === 'fulfilled'
                ? (closedResult.value.positions ?? []) as Record<string, unknown>[]
                : []

            const mappedOpen = openPositions.reduce<Trade[]>((acc, position, index) => {
                const symbol = String(position.tradingsymbol ?? position.instrument ?? '').trim()
                const quantity = toNumber(position.quantity)
                const avgPrice = toNumber(position.average_price ?? position.entry_price ?? position.price)
                const ltp = toNumber(position.last_price ?? position.current_price ?? avgPrice)
                const paperTrading = Boolean(position.paper_trading)
                const action: TradeAction = quantity < 0 ? 'SELL' : 'BUY'

                if (!symbol || quantity === 0 || avgPrice <= 0 || ltp <= 0) return acc

                const exchange = String(position.exchange ?? 'NFO').trim() || 'NFO'
                const product = String(position.product ?? '').trim()
                const subLabel = `${exchange}${product ? ` - ${product}` : ''}`

                acc.push({
                    id: `open_${symbol}_${index}`,
                    symbol,
                    subLabel,
                    action,
                    qty: Math.abs(quantity),
                    avgPrice,
                    ltp,
                    status: 'Open',
                    timestamp: typeof position.timestamp === 'string' ? position.timestamp : undefined,
                    paperTrading,
                    instrumentToken: typeof position.instrument_token === 'number' ? position.instrument_token : undefined,
                })

                return acc
            }, [])

            const mappedClosed = closedPositions.reduce<Trade[]>((acc, position, index) => {
                const symbol = String(position.tradingsymbol ?? position.instrument ?? '').trim()
                const rawQty = toNumber(position.quantity ?? position.filled_quantity)
                const qty = Math.abs(rawQty)
                const avgPrice = toNumber(position.average_price ?? position.entry_price ?? position.price)
                const ltp = toNumber(position.exit_price ?? position.last_price ?? avgPrice)
                const actionRaw = String(position.transaction_type ?? '').toUpperCase()
                const action: TradeAction = actionRaw === 'SELL' ? 'SELL' : 'BUY'
                const paperTrading = Boolean(position.paper_trading)
                const backendPnl = position.realized_pnl ?? position.pnl

                if (!symbol || qty === 0 || avgPrice <= 0 || ltp <= 0) return acc

                const exchange = String(position.exchange ?? 'NFO').trim() || 'NFO'
                const product = String(position.product ?? '').trim()
                const subLabel = `${exchange}${product ? ` - ${product}` : ''}`
                const timestamp = typeof position.exit_timestamp === 'string'
                    ? position.exit_timestamp
                    : typeof position.timestamp === 'string'
                        ? position.timestamp
                        : undefined

                acc.push({
                    id: `closed_${symbol}_${index}`,
                    symbol,
                    subLabel,
                    action,
                    qty,
                    avgPrice,
                    ltp,
                    status: 'Closed',
                    timestamp,
                    paperTrading,
                    realizedPnl: typeof backendPnl === 'number' && Number.isFinite(backendPnl) ? backendPnl : undefined,
                })

                return acc
            }, [])

            const allTrades = [...mappedOpen, ...mappedClosed]
            setLiveTrades(allTrades.filter((trade) => !trade.paperTrading))
            setPaperTrades(allTrades.filter((trade) => trade.paperTrading))
        } catch (error) {
            console.error('Failed to load PnL trades:', error)
            setLiveTrades([])
            setPaperTrades([])
        } finally {
            setLoading(false)
        }
    }, [token, selectedBroker])

    useEffect(() => { fetchPnLTrades() }, [fetchPnLTrades])

    useEffect(() => {
        window.addEventListener('positions-refresh', fetchPnLTrades)
        return () => window.removeEventListener('positions-refresh', fetchPnLTrades)
    }, [fetchPnLTrades])

    useEffect(() => {
        if (wsPnlBreakdown || !token) return
        const broker =
            selectedBroker && !selectedBroker.startsWith('config_') && !selectedBroker.startsWith('connect_')
                ? selectedBroker
                : undefined
        getTradingStatus(token, broker)
            .then((res) => {
                const bd = res.pnl_breakdown as PnlBreakdown | undefined
                if (bd) setRestPnlBreakdown(bd)
            })
            .catch(() => { })
    }, [token, selectedBroker, wsPnlBreakdown])

    // Reset pagination when filters change
    const handleActionFilter = (_: React.MouseEvent, val: ActionFilter | null) => {
        if (val !== null) { setFilterAction(val); setPage(0) }
    }


    const handleDownload = () => {
        if (filteredTrades.length === 0) return

        const escapeCsvValue = (value: string | number): string => {
            const str = String(value)
            return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
        }

        const headers = [
            'Symbol',
            'Exchange/Product',
            'Action',
            'Qty',
            'Avg Price (₹)',
            'LTP (₹)',
            'Invested (₹)',
            'Current Value (₹)',
            'P&L (₹)',
            'P&L (%)',
            'Status',
            'Timestamp',
        ]

        const tradeRows = filteredTrades.map((trade) => {
            const invested = trade.qty * trade.avgPrice
            const currentValue = trade.qty * trade.ltp
            const pnl = calcPnl(trade)
            const pnlPercent = invested !== 0 ? (pnl / invested) * 100 : 0

            return [
                trade.symbol,
                trade.subLabel,
                trade.action,
                trade.qty,
                trade.avgPrice.toFixed(2),
                trade.ltp.toFixed(2),
                invested.toFixed(2),
                currentValue.toFixed(2),
                pnl.toFixed(2),
                pnlPercent.toFixed(2),
                trade.status,
                trade.timestamp ?? 'N/A',
            ].map(escapeCsvValue).join(',')
        })

        const summaryRows = [
            '',
            '',
            ['Unrealised P&L', metrics.unrealisedPnl.toFixed(2)].map(escapeCsvValue).join(','),
            ['Total Charges', metrics.totalCharges.toFixed(2)].map(escapeCsvValue).join(','),
            ['Realised P&L', metrics.realisedPnl.toFixed(2)].map(escapeCsvValue).join(','),
        ]

        const csvContent = [
            headers.map(escapeCsvValue).join(','),
            ...tradeRows,
            ...summaryRows,
        ].join('\n')

        const date = new Date().toISOString().slice(0, 10)
        const fileName = `pnl_statement_${mode}_${date}.csv`
        const BOM = '\uFEFF'  // UTF-8 BOM — forces Excel to read encoding correctly
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const filteredTrades = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase()
        return trades.filter(t =>
            t.symbol.toLowerCase().includes(normalizedSearchTerm) &&
            (filterAction === 'ALL' || t.action === filterAction)
        )
    }, [trades, searchTerm, filterAction])

    const metrics = useMemo(() => {
        const closedPnl = calcRealizedPnl(trades)
        const openPnl = calcUnrealizedPnl(trades)
        const unrealisedPnl = closedPnl + openPnl
        const totalCharges = mode === 'live' ? LIVE_CHARGES : 0
        const realisedPnl = unrealisedPnl - totalCharges
        const hasOpenPositions = trades.some(t => t.status === 'Open' || t.status === 'Partial')
        return { unrealisedPnl, totalCharges, realisedPnl, hasOpenPositions }
    }, [trades, mode])


    const chartData = useMemo(() => {
        const { labels, data } = buildMonthlyPnlData(trades)

        return {
            labels,
            datasets: [{
                label: 'P&L',
                data,
                backgroundColor: data.map(v => v >= 0 ? '#1D9E75' : '#E24B4A'),
                borderRadius: 4,
            }],
        }
    }, [trades])
    const hasChartData = chartData.labels.length > 0 && chartData.datasets[0].data.length > 0


    // const paginatedTrades = filteredTrades.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>

            {/* ── Top bar ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ fontSize: TYPOGRAPHY_SCALE.sectionTitle, fontWeight: 600 }}>
                    Profit and loss details
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                    onClick={handleDownload}
                    disabled={filteredTrades.length === 0}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontSize: TYPOGRAPHY_SCALE.controls, fontWeight: 500 }}
                >
                    Download P&amp;L statement
                </Button>
            </Box>

            
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MetricCard
                        icon={<TrendingUpIcon fontSize="small" />}
                        label="Unrealised P/L"
                        tooltip={metrics.hasOpenPositions ? 'Closed + open position P&L. Updates live while positions are open.' : 'Sum of all closed position P&L. No open positions — this value is static.'}
                        value={metrics.unrealisedPnl}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MetricCard
                        icon={<ReceiptIcon fontSize="small" />}
                        label="Total Charges"
                        tooltip="Broker charges and fees. Always zero for paper trading."
                        value={metrics.totalCharges}
                        colorOverride="text.secondary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MetricCard
                        icon={<WalletIcon fontSize="small" />}
                        label="Realised P/L"
                        tooltip="Unrealised P&L minus total charges. For paper trading, same as unrealised."
                        value={metrics.realisedPnl}
                    />
                </Grid>
            </Grid>

            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: TYPOGRAPHY_SCALE.sectionTitle }}>
                            Monthly P&L report
                        </Typography>
                    </Box>
                    <Box sx={{ height: 300 }}>
                        {hasChartData ? (
                            <Bar data={chartData} options={CHART_OPTIONS as never} />
                        ) : (
                            <Box
                                sx={{
                                    height: '100%',
                                    display: 'grid',
                                    placeItems: 'center',
                                }}
                            >


                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="8" y="30" width="16" height="55" rx="3" fill="rgba(255,255,255,0.08)" />
                                        <rect x="30" y="15" width="16" height="70" rx="3" fill="rgba(255,255,255,0.08)" />
                                        <rect x="52" y="40" width="16" height="45" rx="3" fill="rgba(255,255,255,0.08)" />
                                        <rect x="74" y="20" width="16" height="65" rx="3" fill="rgba(255,255,255,0.08)" />
                                        <rect x="96" y="50" width="16" height="35" rx="3" fill="rgba(255,255,255,0.08)" />
                                        <line x1="0" y1="88" x2="120" y2="88" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                    </svg>
                                    <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', letterSpacing: 0.3 }}>
                                        No chart data available
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>

        </Box>

    )


}
