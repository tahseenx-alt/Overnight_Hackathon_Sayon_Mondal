import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
	Shield,
	Activity,
	Search,
	Upload,
	X,
	Globe,
	Lock,
	ChevronRight,
	TrendingUp,
	Server,
	Cpu,
	Radio,
	Menu,
	FileText,
	CheckCircle,
} from "lucide-react"

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:5000/api/v1/transactions" // Your Node Backend

// --- COMPONENTS (UI Only - Logic Removed) ---

const Sidebar = ({ activeTab, setActiveTab, isOpen, toggleSidebar }) => {
	const menuItems = [
		{ id: "dashboard", icon: Activity, label: "Live Monitor" },
		{ id: "upload", icon: Upload, label: "Upload Data" }, // Changed from Analysis to Upload
		{ id: "network", icon: Globe, label: "Mule Networks" },
	]

	return (
		<div
			className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/95 backdrop-blur-xl border-r border-green-500/20 transform transition-transform duration-300 ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			} md:translate-x-0 flex flex-col`}
		>
			<div className="p-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Shield className="w-8 h-8 text-green-500 animate-pulse" />
					<span className="text-xl font-bold tracking-wider text-white">
						UPI<span className="text-green-500">SENTINEL</span>
					</span>
				</div>
				<button
					onClick={toggleSidebar}
					className="md:hidden text-green-500"
				>
					<X />
				</button>
			</div>
			<nav className="mt-8 space-y-2 px-4 flex-1">
				{menuItems.map((item) => (
					<button
						key={item.id}
						onClick={() => setActiveTab(item.id)}
						className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
							activeTab === item.id
								? "bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
								: "text-gray-400 hover:bg-white/5 hover:text-white"
						}`}
					>
						<item.icon
							className={`w-5 h-5 ${
								activeTab === item.id
									? "animate-bounce-subtle"
									: ""
							}`}
						/>
						<span className="font-mono tracking-wide">
							{item.label}
						</span>
						{activeTab === item.id && (
							<ChevronRight className="ml-auto w-4 h-4" />
						)}
					</button>
				))}
			</nav>
		</div>
	)
}

const StatCard = ({ title, value, subtext, icon: Icon, alert = false }) => (
	<div
		className={`relative p-6 rounded-xl border backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-transform ${
			alert
				? "bg-red-900/10 border-red-500/30"
				: "bg-green-900/5 border-green-500/20"
		}`}
	>
		<div
			className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 ${
				alert ? "bg-red-500" : "bg-green-500"
			}`}
		></div>
		<div className="flex justify-between items-start mb-4">
			<div>
				<h3 className="text-gray-400 text-xs font-mono uppercase tracking-widest">
					{title}
				</h3>
				<div
					className={`text-2xl font-bold mt-1 font-mono ${
						alert ? "text-red-400" : "text-white"
					}`}
				>
					{value}
				</div>
			</div>
			<div
				className={`p-2 rounded-lg ${
					alert
						? "bg-red-500/20 text-red-400"
						: "bg-green-500/20 text-green-400"
				}`}
			>
				<Icon size={20} />
			</div>
		</div>
		<div className="text-xs text-gray-500 font-mono border-t border-dashed border-gray-700 pt-2 mt-2">
			{subtext}
		</div>
	</div>
)

const LiveFeed = ({ transactions, onSelectTransaction }) => (
	<div className="h-full flex flex-col">
		<div className="flex justify-between items-center mb-4">
			<h3 className="text-white font-mono flex items-center gap-2">
				<Activity className="w-4 h-4 text-green-500" /> ANALYZED STREAM
			</h3>
			<div className="flex items-center gap-2">
				<span className="text-[10px] text-gray-500 font-mono">
					LIVE
				</span>
				<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
			</div>
		</div>
		<div className="flex-1 overflow-hidden relative rounded-xl border border-green-500/20 bg-black/40 backdrop-blur-md">
			<div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-transparent via-green-500/5 to-transparent h-4 animate-scanline" />
			<div className="overflow-y-auto h-full p-4 space-y-2 scrollbar-hide">
				{transactions.length === 0 ? (
					<div className="text-gray-500 text-center mt-10 font-mono text-sm">
						Waiting for CSV Upload...
					</div>
				) : (
					transactions.map((txn, idx) => (
						<div
							key={idx}
							onClick={() => onSelectTransaction(txn)}
							className={`p-3 rounded-lg border cursor-pointer transition-all hover:translate-x-1 flex items-center justify-between text-sm font-mono group ${
								txn.verdict === "FRAUD"
									? "bg-red-500/10 border-red-500/40 hover:bg-red-500/20"
									: "bg-green-500/5 border-green-500/10 hover:bg-green-500/10"
							}`}
						>
							<div className="flex items-center gap-3">
								<div
									className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
										txn.verdict === "FRAUD"
											? "bg-red-500 shadow-red-500"
											: "bg-green-500 shadow-green-500"
									}`}
								/>
								<div>
									<div className="text-gray-300 group-hover:text-white transition-colors">
										{txn.transaction_id}
									</div>
									<div className="text-[10px] text-gray-500">
										{txn.verdict}
									</div>
								</div>
							</div>
							<div className="text-right">
								<div
									className={
										txn.verdict === "FRAUD"
											? "text-red-400 font-bold"
											: "text-green-400"
									}
								>
									₹{txn.amount}
								</div>
								<div className="text-[10px] text-gray-500">
									{txn.sender_upi?.split("@")[0]}...
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	</div>
)

// New Component: The Upload Modal (Replaces Simulation)
const UploadModal = ({ onUploadSuccess, onClose }) => {
	const [file, setFile] = useState(null)
	const [loading, setLoading] = useState(false)
	const [status, setStatus] = useState("idle")

	const handleUpload = async () => {
		if (!file) return
		setLoading(true)
		setStatus("uploading")

		const formData = new FormData()
		formData.append("file", file)

		try {
			// CALLING YOUR REAL BACKEND HERE
			const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			setStatus("success")
			// Pass the analyzed data back up to the main App
			onUploadSuccess(res.data.data)
			setTimeout(onClose, 1000)
		} catch (error) {
			console.error(error)
			setStatus("error")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
			<div className="bg-black border border-green-500/30 rounded-xl p-8 max-w-md w-full relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
				<h2 className="text-xl font-mono text-white mb-6 flex items-center gap-2">
					<Upload className="text-green-500" /> DATA INGESTION
				</h2>

				<div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-green-500/50 transition-colors cursor-pointer relative">
					<input
						type="file"
						accept=".csv"
						onChange={(e) => setFile(e.target.files[0])}
						className="absolute inset-0 opacity-0 cursor-pointer"
					/>
					<FileText className="mx-auto text-gray-500 mb-2" />
					<p className="text-sm text-gray-300 font-mono">
						{file ? file.name : "Drop CSV File Here"}
					</p>
				</div>

				<div className="mt-6 flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 py-2 border border-gray-700 text-gray-400 font-mono text-sm hover:bg-white/5 rounded"
					>
						CANCEL
					</button>
					<button
						onClick={handleUpload}
						disabled={loading || !file}
						className="flex-1 py-2 bg-green-600 text-black font-bold font-mono text-sm hover:bg-green-500 rounded disabled:opacity-50"
					>
						{loading ? "PROCESSING..." : "INITIATE SCAN"}
					</button>
				</div>
				{status === "success" && (
					<div className="mt-4 text-green-400 text-center font-mono text-xs">
						ANALYSIS COMPLETE. SYNCING...
					</div>
				)}
				{status === "error" && (
					<div className="mt-4 text-red-400 text-center font-mono text-xs">
						CONNECTION FAILED. CHECK CONSOLE.
					</div>
				)}
			</div>
		</div>
	)
}

const TransactionDetail = ({ txn, onClose }) => {
	if (!txn) return null
	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
			<div className="w-full max-w-4xl bg-black border border-green-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)] relative flex flex-col max-h-[90vh]">
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
				<div className="p-6 border-b border-gray-800 flex justify-between items-start bg-gray-900/50">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<h2 className="text-2xl font-bold text-white font-mono">
								{txn.transaction_id}
							</h2>
							<span
								className={`px-2 py-1 rounded text-xs font-bold uppercase ${
									txn.verdict === "FRAUD"
										? "bg-red-500 text-black"
										: "bg-green-500 text-black"
								}`}
							>
								{txn.risk_score} SCORE
							</span>
						</div>
						<p className="text-gray-400 text-sm font-mono">
							{txn.reason}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
					>
						<X size={20} />
					</button>
				</div>
				<div className="p-8 text-center">
					<div className="grid grid-cols-2 gap-4 text-left">
						<div className="p-4 bg-gray-900 rounded border border-gray-800">
							<label className="text-xs text-gray-500 block">
								SENDER
							</label>
							<div className="text-white font-mono">
								{txn.sender_upi}
							</div>
						</div>
						<div className="p-4 bg-gray-900 rounded border border-gray-800">
							<label className="text-xs text-gray-500 block">
								AMOUNT
							</label>
							<div className="text-white font-mono">
								₹{txn.amount}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

// --- MAIN APP ---

const App = () => {
	const [activeTab, setActiveTab] = useState("dashboard")
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [transactions, setTransactions] = useState([]) // This stores REAL backend data
	const [selectedTxn, setSelectedTxn] = useState(null)
	const [stats, setStats] = useState({ total: 0, fraud: 0, saved: 0 })

	// Handle data coming back from the Upload Modal
	const handleAnalysisResult = (data) => {
		// 'data' comes from backend: [{transaction_id, verdict, risk_score...}, ...]
		setTransactions(data)

		// Calculate stats on the fly based on the CSV result
		const frauds = data.filter((t) => t.verdict === "FRAUD")
		const savedAmount = frauds.reduce(
			(sum, t) => sum + parseFloat(t.amount),
			0
		)

		setStats({
			total: data.length,
			fraud: frauds.length,
			saved: savedAmount,
		})

		setActiveTab("dashboard") // Switch back to dashboard to see results
	}

	return (
		<div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-green-500/30 overflow-x-hidden">
			<div
				className="fixed inset-0 z-0 opacity-20 pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			></div>
			<div className="fixed inset-0 z-0 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none"></div>

			<Sidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				isOpen={sidebarOpen}
				toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>

			<div className="md:ml-64 relative z-10 min-h-screen flex flex-col">
				<header className="h-16 border-b border-green-500/20 bg-black/50 backdrop-blur-md sticky top-0 px-6 flex items-center justify-between z-40">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSidebarOpen(true)}
							className="md:hidden text-white"
						>
							<Menu />
						</button>
						<h1 className="text-lg font-mono text-gray-300 hidden sm:block">
							// SYS:{" "}
							<span className="text-white font-bold">
								SENTINEL_V4
							</span>
						</h1>
					</div>
				</header>

				<main className="flex-1 p-4 md:p-8 overflow-hidden">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<StatCard
							title="Transactions Scanned"
							value={stats.total}
							subtext="Current Batch"
							icon={Server}
						/>
						<StatCard
							title="Threats Detected"
							value={stats.fraud}
							subtext="High Risk"
							icon={Shield}
							alert={true}
						/>
						<StatCard
							title="Potential Loss Saved"
							value={`₹${stats.saved.toLocaleString()}`}
							subtext="Based on flagged volume"
							icon={TrendingUp}
						/>
						<StatCard
							title="Engine Status"
							value="ONLINE"
							subtext="ML + Rules Active"
							icon={Cpu}
						/>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
						<div className="lg:col-span-2 flex flex-col gap-6 h-full">
							<div className="flex-1 bg-black/40 border border-green-500/20 rounded-xl relative flex items-center justify-center">
								<p className="text-gray-500 font-mono text-sm">
									DATA VISUALIZATION STANDBY
								</p>
							</div>
						</div>
						<div className="h-full">
							<LiveFeed
								transactions={transactions}
								onSelectTransaction={setSelectedTxn}
							/>
						</div>
					</div>
				</main>
			</div>

			{/* Render Upload Modal when tab is selected */}
			{activeTab === "upload" && (
				<UploadModal
					onUploadSuccess={handleAnalysisResult}
					onClose={() => setActiveTab("dashboard")}
				/>
			)}

			{selectedTxn && (
				<TransactionDetail
					txn={selectedTxn}
					onClose={() => setSelectedTxn(null)}
				/>
			)}

			<style>{`
                @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(500%); } }
                .animate-scanline { animation: scanline 2.5s linear infinite; }
                .animate-bounce-subtle { animation: bounce 2s infinite; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
		</div>
	)
}

export default App
