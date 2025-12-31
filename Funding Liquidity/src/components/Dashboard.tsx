
import React, { useEffect, useState, useRef } from 'react';
import { fetchAllMetrics, processCsvData, orchestrateLiveFetch } from '../services/dataServices';
import { MetricCategory, MetricData } from '../services/types';
import MetricCard from './MetricCard';
import CalendarAlert from './CalendarAlert';
import DetailModal from './DetailModal';

const Dashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Fetching state
    const [isFetchingLive, setIsFetchingLive] = useState(false);
    const [fetchLog, setFetchLog] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshDashboard = async () => {
        const data = await fetchAllMetrics();
        setMetrics(data);
        const validCount = data.filter(d => d.status === 'success').length;
        setDataLoaded(validCount > 0);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            // 1. Try to auto-load liquidity_data.csv from server root
            try {
                const response = await fetch('liquidity_data.csv');
                if (response.ok) {
                    const text = await response.text();
                    // Ensure it's not HTML (404 redirect)
                    if (text.trim().startsWith('DATE') || text.includes(',')) {
                        const success = processCsvData(text);
                        if (success) {
                            console.log('Auto-loaded liquidity_data.csv');
                        }
                    }
                }
            } catch (e) {
                console.log('No default CSV found.');
            }

            // 2. Load Metrics (Populated or Empty)
            await refreshDashboard();
            setLoading(false);
        };

        init();
    }, []);

    const handleLiveFetch = async () => {
        setIsFetchingLive(true);
        setFetchLog('Initializing connection to Federal Reserve Economic Data (FRED)...');

        try {
            await orchestrateLiveFetch((msg) => {
                setFetchLog(prev => msg); // Update current status
            });
            await refreshDashboard();
        } catch (e) {
            setFetchLog('Connection interrupted. Partial data loaded.');
        } finally {
            setTimeout(() => {
                setIsFetchingLive(false);
            }, 1000);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                const success = processCsvData(text);
                if (success) {
                    await refreshDashboard();
                } else {
                    alert("Failed to parse CSV. Ensure formatting: DATE, COLUMN_NAME...");
                }
            }
        };
        reader.readAsText(file);
    };

    // Sections
    const fundingPrimary = metrics.filter(m => m.definition.section === 'Funding Liquidity' && m.definition.category === MetricCategory.PRIMARY);
    const fundingSecondary = metrics.filter(m => m.definition.section === 'Funding Liquidity' && m.definition.category === MetricCategory.SECONDARY);

    const dealerPrimary = metrics.filter(m => m.definition.section === 'Primary Dealer Statistics' && m.definition.category === MetricCategory.PRIMARY);
    const dealerSecondary = metrics.filter(m => m.definition.section === 'Primary Dealer Statistics' && m.definition.category === MetricCategory.SECONDARY);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-gray-400 text-xs font-mono animate-pulse">BOOTING ANALYTICS ENGINE...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-20 relative">

            {/* Fetching Overlay */}
            {isFetchingLive && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center font-mono">
                    <div className="w-96 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-indigo-600 animate-pulse"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                            </span>
                            <h3 className="text-white font-bold">Live Data Uplink</h3>
                        </div>
                        <div className="h-24 font-mono text-xs text-green-400 overflow-hidden leading-relaxed whitespace-pre-wrap">
                            {`> Establishing secure tunnel...\n> Handshaking with FRED API...\n> ${fetchLog}`}
                        </div>
                        <div className="mt-4 text-center text-gray-500 text-[10px] uppercase tracking-widest">
                            Do not close window
                        </div>
                    </div>
                </div>
            )}

            <CalendarAlert />

            <header className="px-6 py-5 border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-400">Liquidity</span>
                            <span className="text-gray-500 font-light">Quant</span>
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">Funding & Collateral Monitor</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-gray-500">
                            <span className={`flex items-center gap-1.5 ${dataLoaded ? 'text-green-500' : 'text-red-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${dataLoaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {dataLoaded ? 'System Online' : 'No Data Source'}
                            </span>
                            <span>Last Upd: {new Date().toLocaleTimeString()}</span>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all text-xs font-mono group"
                        >
                            <span className="text-gray-300 group-hover:text-white">Import CSV</span>
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-6 py-8 max-w-[1920px] mx-auto space-y-12">

                {!dataLoaded && !isFetchingLive && (
                    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center max-w-2xl mx-auto">
                        <div className="text-gray-500 mb-2">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <h3 className="text-lg font-medium text-white mb-2">Initialize Data Feed</h3>
                            <p className="text-sm max-w-md mx-auto mb-6">
                                No local data found. System can pull live metrics directly from FRED using a secure proxy.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleLiveFetch}
                                    className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-6 rounded-md transition-colors text-sm flex items-center gap-2"
                                >
                                    <span>⚡</span> Pull Live Data
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-6 rounded-md transition-colors text-sm"
                                >
                                    Upload CSV
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Funding Liquidity Section */}
                <div className={!dataLoaded ? 'opacity-30 pointer-events-none filter blur-sm transition-all duration-500' : ''}>
                    <h1 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="bg-primary-500/10 text-primary-500 px-3 py-1 rounded text-sm mr-3 border border-primary-500/20">Market</span>
                        Funding Liquidity
                    </h1>

                    <section className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-1 border-l-4 border-primary-500">
                            Primary Raw Data
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {fundingPrimary.map(metric => (
                                <MetricCard
                                    key={metric.definition.id}
                                    data={metric}
                                    onClick={setSelectedMetric}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-1 border-l-4 border-indigo-500">
                            Secondary Calculated Metrics
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {fundingSecondary.map(metric => (
                                <MetricCard
                                    key={metric.definition.id}
                                    data={metric}
                                    onClick={setSelectedMetric}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Dealer Statistics Section */}
                <div className={`border-t border-gray-800 pt-8 ${!dataLoaded ? 'opacity-30 pointer-events-none filter blur-sm' : ''}`}>
                    <h1 className="text-xl font-bold text-white mb-6 flex items-center">
                        <span className="bg-accent-green/10 text-accent-green px-3 py-1 rounded text-sm mr-3 border border-accent-green/20">Intermediaries</span>
                        Primary Dealer Statistics
                    </h1>

                    <section className="mb-8">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-1 border-l-4 border-accent-green">
                            Dealer Inventory & Financing
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {dealerPrimary.map(metric => (
                                <MetricCard
                                    key={metric.definition.id}
                                    data={metric}
                                    onClick={setSelectedMetric}
                                />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-1 border-l-4 border-teal-500">
                            Turnover & Leverage (Calculated)
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {dealerSecondary.map(metric => (
                                <MetricCard
                                    key={metric.definition.id}
                                    data={metric}
                                    onClick={setSelectedMetric}
                                />
                            ))}
                        </div>
                    </section>
                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-12 py-8 text-center text-gray-600 text-sm">
                <p>&copy; {new Date().getFullYear()} LiquidityQuant Fund Analytics. Internal Use Only.</p>
                <p className="mt-2 text-xs text-gray-700">Data Source: Live FRED Feed (Proxied) or Manual CSV.</p>
            </footer>

            {/* Modal */}
            {selectedMetric && (
                <DetailModal
                    metric={selectedMetric}
                    onClose={() => setSelectedMetric(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
