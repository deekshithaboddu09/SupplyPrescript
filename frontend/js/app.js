
// SupplyPrescript frontend controller extracted from the reference UI.
// Shipment data is loaded from the SupplyPrescript backend API. Decision evaluation remains client-side in this version.
// --- 1. SEED DATA & SYNTHETIC DATA GENERATOR ---
// --- USER AUTHENTICATION ---

const API_BASE_URL = "http://127.0.0.1:8000/api";

window.logoutUser = function () {
    localStorage.removeItem("sp_access_token");
    localStorage.removeItem("sp_user");

    window.location.href = "login.html";
}

async function validateUserSession() {
    const token = localStorage.getItem("sp_access_token");
    const savedUser = localStorage.getItem("sp_user");

    if (!token || !savedUser) {
        window.location.replace("login.html");
        return false;
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        logoutUser();
        return false;
    }

    if (user.role === "admin") {
        window.location.replace("admin.html");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            logoutUser();
            return false;
        }

        const currentUser = await response.json();
        const displayUser = currentUser.user || currentUser;

        const actualName = displayUser.name || user.name || "User";

        const nameElement = document.getElementById("userDisplayName");
        const dropdownNameElement = document.getElementById("profileDropdownName");

        if (nameElement) {
            nameElement.textContent = actualName;
        }

        if (dropdownNameElement) {
            dropdownNameElement.textContent = actualName;
       }

        return true;

    } catch (error) {
        console.error("Session validation failed:", error);
        alert("Unable to verify your login. Please check the backend.");
        return false;
    }
}

// Protect dashboard when navigating back after logout
window.addEventListener("pageshow", function (event) {
    if (event.persisted && !localStorage.getItem("sp_access_token")) {
        window.location.replace("login.html");
    }
});
        const DETAILED_SAMPLE_SHIPMENTS = [
            { 
                id: 'SHP-4092', 
                name: 'Microcontroller Chips', 
                origin: 'Shanghai, CN', 
                dest: 'Rotterdam, NL', 
                supplier: 'Semico Tech', 
                status: 'CRITICAL', 
                delayDays: 4.0, 
                penalty: 180000,
                reason: 'Typhoon severe port backlog at origin terminal.',
                impact: 'European factory assembly line shutdown within 48 hours.',
                options: [
                    { id: 'opt-a', name: 'Option A: Air Freight Expedite', cost: 24500, delayDays: 0, note: 'Recommended: Bypasses sea port backlog completely.', type: 'AIR_EXPEDITE' },
                    { id: 'opt-b', name: 'Option B: Switch Supplier', cost: 12800, delayDays: 1.5, note: 'Partial delay mitigation using regional partner in Malaysia.', type: 'ALT_SUPPLIER' },
                    { id: 'opt-c', name: 'Option C: Accept Delay', cost: 0, delayDays: 4.0, note: 'No extra cost, but incurs full factory shutdown penalty.', type: 'ACCEPT_DELAY' }
                ]
            },
            { 
                id: 'SHP-1044', 
                name: 'Display Panels 12"', 
                origin: 'Seoul, KR', 
                dest: 'Long Beach, US', 
                supplier: 'Lumina Display', 
                status: 'CRITICAL', 
                delayDays: 3.0, 
                penalty: 95000,
                reason: 'Flight space shortage caused cargo backlog at Seoul airport.',
                impact: 'Assembly bottleneck at West Coast manufacturing facility.',
                options: [
                    { id: 'opt-a', name: 'Option A: Secondary Air Courier', cost: 14000, delayDays: 0, note: 'Recommended: Dedicated air courier bypasses main terminal backlog.', type: 'AIR_EXPEDITE' },
                    { id: 'opt-b', name: 'Option B: Local Inventory Reserve', cost: 8500, delayDays: 1.0, note: 'Draw down safety stock from secondary regional warehouse.', type: 'ALT_SUPPLIER' },
                    { id: 'opt-c', name: 'Option C: Accept Delay', cost: 0, delayDays: 3.0, note: 'Accept line delay and reschedule assembly shift.', type: 'ACCEPT_DELAY' }
                ]
            },
            { 
                id: 'SHP-7703', 
                name: 'Power Supply Modules', 
                origin: 'Taipei, TW', 
                dest: 'Frankfurt, DE', 
                supplier: 'VoltDynamics', 
                status: 'MODERATE', 
                delayDays: 1.5, 
                penalty: 45000,
                reason: 'Documentation mismatch caused temporary customs hold.',
                impact: 'Minor assembly schedule buffer delay.',
                options: [
                    { id: 'opt-a', name: 'Option A: Priority Customs Expedite', cost: 6500, delayDays: 0, note: 'Recommended: Direct customs legal clearance broker.', type: 'AIR_EXPEDITE' },
                    { id: 'opt-b', name: 'Option B: Alternate Carrier Reroute', cost: 3200, delayDays: 0.5, note: 'Reroute via secondary ground transit corridor.', type: 'ALT_SUPPLIER' },
                    { id: 'opt-c', name: 'Option C: Accept Delay', cost: 0, delayDays: 1.5, note: 'Wait for standard customs processing window.', type: 'ACCEPT_DELAY' }
                ]
            },
            { 
                id: 'SHP-8921', 
                name: 'Aluminum Enclosures', 
                origin: 'Shenzhen, CN', 
                dest: 'Long Beach, US', 
                supplier: 'PrecisionFab', 
                status: 'NORMAL', 
                delayDays: 0, 
                penalty: 0,
                reason: 'On schedule in normal transit.',
                impact: 'No negative business impact.',
                options: [
                    { id: 'opt-std', name: 'Standard Delivery Plan', cost: 0, delayDays: 0, note: 'Shipment proceeding normally. No action required.', type: 'NO_ACTION' }
                ]
            },
            { 
                id: 'SHP-5532', 
                name: 'Lithium Battery Cells', 
                origin: 'Nagoya, JP', 
                dest: 'Hamburg, DE', 
                supplier: 'EnergyTech Corp', 
                status: 'NORMAL', 
                delayDays: 0, 
                penalty: 0,
                reason: 'On schedule in normal transit.',
                impact: 'No negative business impact.',
                options: [
                    { id: 'opt-std', name: 'Standard Delivery Plan', cost: 0, delayDays: 0, note: 'Shipment proceeding normally. No action required.', type: 'NO_ACTION' }
                ]
            }
        ];

        function generateExpandedShipmentsDataset(targetTotal = 142) {
            const list = [...DETAILED_SAMPLE_SHIPMENTS];
            const products = ['Capacitors 100uF', 'Sensor Hubs', 'Wire Harnesses', 'LED Assemblies', 'Cooling Fans', 'PCB Boards', 'Voltage Regulators'];
            const origins = ['Shenzhen, CN', 'Tokyo, JP', 'Busan, KR', 'Penang, MY', 'Ho Chi Minh, VN', 'Kaohsiung, TW'];
            const dests = ['Rotterdam, NL', 'Long Beach, US', 'Frankfurt, DE', 'Antwerp, BE', 'Hamburg, DE'];
            const suppliers = ['Global Logistics Co', 'Nexus Semi', 'Apex Components', 'Delta Micro', 'Pacific Freight Lines'];

            for (let i = list.length + 1; i <= targetTotal; i++) {
                const id = `SHP-${1000 + i}`;
                const name = products[i % products.length];
                const origin = origins[i % origins.length];
                const dest = dests[i % dests.length];
                const supplier = suppliers[i % suppliers.length];
                
                list.push({
                    id: id,
                    name: name,
                    origin: origin,
                    dest: dest,
                    supplier: supplier,
                    status: 'NORMAL',
                    delayDays: 0,
                    penalty: 0,
                    reason: 'On schedule in normal transit.',
                    impact: 'No negative business impact.',
                    options: [
                        { id: 'opt-std', name: 'Standard Delivery Plan', cost: 0, delayDays: 0, note: 'Shipment proceeding normally.', type: 'NO_ACTION' }
                    ]
                });
            }
            return list;
        }

        function evaluatePrescriptiveOption(shipment, option) {
            const basePenalty = shipment.penalty || 0;
            const extraCost = option.cost || 0;
            const baseDays = shipment.delayDays || 1;
            const residualRatio = baseDays > 0 ? Math.min(1, Math.max(0, option.delayDays / baseDays)) : 0;
            const residualPenalty = Math.round(basePenalty * residualRatio);
            const penaltyAvoided = basePenalty - residualPenalty;
            const netBenefit = penaltyAvoided - extraCost;

            return {
                optionId: option.id,
                name: option.name,
                extraCost: extraCost,
                delayDays: option.delayDays,
                penaltyAvoided: penaltyAvoided,
                netBenefit: netBenefit,
                isPositiveROI: netBenefit > 0,
                formattedBenefit: netBenefit >= 0 ? `+$${netBenefit.toLocaleString()}` : `-$${Math.abs(netBenefit).toLocaleString()}`
            };
        }

        function calculateSystemMetrics(shipments, decisionLogs = []) {
            const activeCount = shipments.length;
            const delayedShipments = shipments.filter(s => s.status === 'CRITICAL' || s.status === 'MODERATE');
            const delayedCount = delayedShipments.length;
            const totalExposure = delayedShipments.reduce((sum, s) => sum + (s.penalty || 0), 0);
            const recordedDecisionsCount = decisionLogs.length;

            return {
                activeCount,
                delayedCount,
                totalExposure,
                recordedDecisionsCount
            };
        }

        // --- 2. APPLICATION CONTROLLER LOGIC ---
        function loadSavedLogs() {
            try {
                const saved = localStorage.getItem('supplyprescript_decisions');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return Array.isArray(parsed) ? parsed : [];
                }
            } catch (e) {
                console.error('LocalStorage read error:', e);
            }
            // Start with an empty history; only decisions made in this browser are shown.
            return [];
        }

        function getShipmentsDataset() {
            // Offline fallback: use only the five explicit sample shipments, not 142 generated demo rows.
            return DETAILED_SAMPLE_SHIPMENTS.map(shipment => ({
                ...shipment,
                options: (shipment.options || []).map(option => ({ ...option }))
            }));
        }

        const state = {
            shipments: [],
            decisionLogs: loadSavedLogs(),
            pendingExecution: null
        };

        function saveLogsToStorage() {
            try {
                localStorage.setItem('supplyprescript_decisions', JSON.stringify(state.decisionLogs));
            } catch(e) { console.error('LocalStorage write error:', e); }
        }

        function updateOverviewMetrics() {
            if (!state.shipments || state.shipments.length === 0) {
                state.shipments = getShipmentsDataset();
            }

            const m = calculateSystemMetrics(state.shipments, state.decisionLogs);

            const elActive = document.getElementById('statActiveCount');
            const elDelayed = document.getElementById('statDelayedCount');
            const elDecisions = document.getElementById('statDecisionsCount');
            const elExposure = document.getElementById('statTotalExposure');

            if (elActive) elActive.textContent = m.activeCount;
            if (elDelayed) elDelayed.textContent = m.delayedCount;
            if (elDecisions) elDecisions.textContent = m.recordedDecisionsCount;
            if (elExposure) elExposure.textContent = `$${m.totalExposure.toLocaleString()}`;
        }

        let roiChartInstance = null;
        let disruptionChartInstance = null;

        function switchTab(tabId) {
            const screens = document.querySelectorAll('.screen-view');
            screens.forEach(screen => screen.classList.add('hidden'));

            const targetScreen = document.getElementById(`screen-${tabId}`);
            if (targetScreen) {
                targetScreen.classList.remove('hidden');
            }

            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => {
                btn.classList.remove('bg-blue-50', 'text-blue-600', 'font-bold');
                btn.classList.add('text-slate-600', 'font-semibold');
            });

            const activeBtn = document.getElementById(`nav-${tabId}`);
            if (activeBtn) {
                activeBtn.classList.add('bg-blue-50', 'text-blue-600', 'font-bold');
                activeBtn.classList.remove('text-slate-600', 'font-semibold');
            }

            if (tabId === 'overview') {
                updateOverviewMetrics();
            } else if (tabId === 'shipments') {
                renderShipmentsTable();
            } else if (tabId === 'recommendations') {
                const disruptionElem = document.getElementById('disruptionSelect');
                const currentTarget = disruptionElem ? disruptionElem.value : 'SHP-4092';
                renderStudioContent(currentTarget);
            } else if (tabId === 'decision-history') {
                renderDecisionHistory();
            } else if (tabId === 'performance') {
                setTimeout(initAnalyticsCharts, 50);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function viewShipmentDetails(shipmentId) {
            if (!state.shipments || state.shipments.length === 0) {
                state.shipments = getShipmentsDataset();
            }

            const target = state.shipments.find(s => s.id === shipmentId);
            if(!target) return;

            document.getElementById('modalShipmentId').textContent = target.id;
            document.getElementById('modalShipmentName').textContent = target.name;

            const targetOpts = target.options || [];

            let optionsHTML = targetOpts.map((opt, idx) => {
                const isRec = idx === 0 && target.status !== 'NORMAL';
                const evalMath = evaluatePrescriptiveOption(target, opt);
                const optCost = typeof opt.cost === 'number' ? opt.cost : 0;
                const optDelay = typeof opt.delayDays === 'number' ? opt.delayDays : 0;
                const optName = opt.name || `Option ${idx + 1}`;
                const optNote = opt.note || '';

                return `
                <div class="p-4 rounded-xl border ${isRec ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200'} space-y-2 relative">
                    ${isRec ? '<span class="text-[9px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded uppercase font-mono absolute top-3 right-3">★ Recommended Choice</span>' : ''}
                    <div class="font-bold text-slate-900 text-xs">${optName}</div>
                    <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div><span class="text-slate-500">Estimated Cost:</span> <span class="text-slate-800 font-semibold">$${optCost.toLocaleString()}</span></div>
                        <div><span class="text-slate-500">Expected Delay:</span> <span class="${optDelay === 0 ? 'text-emerald-600 font-bold' : 'text-amber-600'}">+${optDelay}d</span></div>
                    </div>
                    <p class="text-[11px] text-slate-600 border-t border-slate-200/80 pt-2">${optNote}</p>
                    ${target.status !== 'NORMAL' ? `
                        <button onclick="promptDecisionConfirm('${optName.replace(/'/g, "\\'")}', '${target.name.replace(/'/g, "\\'")} (${target.id})', ${optCost}, '${evalMath.formattedBenefit}')" 
                            class="w-full mt-2 py-1.5 ${isRec ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold'} rounded-lg text-xs transition-colors shadow-xs">
                            Select Action
                        </button>
                    ` : ''}
                </div>
            `}).join('');

            document.getElementById('modalShipmentContent').innerHTML = `
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-slate-500">Route: <strong class="text-slate-800 font-mono">${target.origin || ''} → ${target.dest || ''}</strong></span>
                        <span class="text-slate-500">Supplier: <strong class="text-slate-800">${target.supplier || ''}</strong></span>
                    </div>
                    <div class="text-xs pt-1">
                        <span class="text-slate-500 font-medium">Problem Root Cause:</span>
                        <p class="text-slate-800 font-semibold mt-0.5">${target.reason || 'No disruption reported.'}</p>
                    </div>
                    <div class="flex justify-between items-center pt-2 text-xs border-t border-slate-200/80">
                        <span class="text-slate-500">Expected Delay: <strong class="text-rose-600 font-mono font-bold">+${target.delayDays || 0} Days</strong></span>
                        <span class="text-slate-500">Unmitigated Exposure: <strong class="text-rose-600 font-mono font-bold">$${(target.penalty || 0).toLocaleString()}</strong></span>
                    </div>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Strategic Decision Options</h4>
                    <div class="space-y-2.5">
                        ${optionsHTML}
                    </div>
                </div>
            `;

            document.getElementById('shipmentDetailModal').classList.remove('hidden');
        }

        function closeShipmentModal() {
            document.getElementById('shipmentDetailModal').classList.add('hidden');
        }

        function openDecisionForShipment(shipmentId) {
            const select = document.getElementById('disruptionSelect');
            if(select) select.value = shipmentId;
            renderStudioContent(shipmentId);
            switchTab('recommendations');
        }

        function changeStudioShipment(shipmentId) {
            renderStudioContent(shipmentId);
        }

        function renderStudioContent(shipmentId) {
            if (!state.shipments || state.shipments.length === 0) {
                state.shipments = getShipmentsDataset();
            }

            const target = state.shipments.find(s => s.id === shipmentId) || state.shipments[0];

            const problemCard = document.getElementById('problemSummaryCard');
            if (problemCard && target) {
                problemCard.innerHTML = `
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-mono uppercase font-bold">Problem Diagnosis</span>
                                <h2 class="text-base font-bold text-slate-900">${target.name || ''} (${target.id || ''})</h2>
                            </div>
                            <p class="text-xs text-slate-500 mt-1">${target.reason || 'No disruption reported.'}</p>
                        </div>
                        <div class="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-right">
                            <div class="text-[10px] text-slate-500 font-mono uppercase font-semibold">Unmitigated Exposure</div>
                            <div class="text-base font-bold text-rose-600 font-mono">$${(target.penalty || 0).toLocaleString()} Penalty</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1 text-slate-600">
                        <div><span class="text-slate-400">Route:</span> <span class="font-mono text-slate-800 font-semibold">${target.origin || ''} → ${target.dest || ''}</span></div>
                        <div><span class="text-slate-400">Supplier:</span> <span class="text-slate-800 font-semibold">${target.supplier || ''}</span></div>
                        <div><span class="text-slate-400">Expected Delay:</span> <span class="font-mono text-rose-600 font-bold">+${target.delayDays || 0} Days</span></div>
                    </div>
                `;
            }

            const optionsContainer = document.getElementById('optionsContainer');
            if (!optionsContainer || !target) return;

            const defaultOptA = { name: 'Option A: Air Freight Expedite', cost: 24500, delayDays: 0, note: 'Bypasses sea port backlog completely.' };
            const defaultOptB = { name: 'Option B: Switch Supplier', cost: 12800, delayDays: 1.5, note: 'Partial delay mitigation using regional partner.' };
            const defaultOptC = { name: 'Option C: Accept Delay', cost: 0, delayDays: target.delayDays || 0, note: 'Accept late arrival date.' };

            const targetOpts = target.options || [];
            const optA = targetOpts[0] || defaultOptA;
            const optB = targetOpts[1] || defaultOptB;
            const optC = targetOpts[2] || defaultOptC;

            const evalA = evaluatePrescriptiveOption(target, optA);
            const evalB = evaluatePrescriptiveOption(target, optB);
            const evalC = evaluatePrescriptiveOption(target, optC);

            const nameA = optA.name || defaultOptA.name;
            const nameB = optB.name || defaultOptB.name;
            const nameC = optC.name || defaultOptC.name;
            const costA = typeof optA.cost === 'number' ? optA.cost : defaultOptA.cost;
            const costB = typeof optB.cost === 'number' ? optB.cost : defaultOptB.cost;
            const costC = typeof optC.cost === 'number' ? optC.cost : defaultOptC.cost;

            optionsContainer.innerHTML = `
                <!-- Option A (Recommended) -->
                <div class="bg-white border-2 border-blue-600 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative shadow-md">
                    <div class="absolute -top-3 left-5 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        ★ Recommended Pathway
                    </div>

                    <div class="space-y-3 pt-1">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h4 class="text-sm font-bold text-slate-900">${nameA}</h4>
                            <span class="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">Fastest</span>
                        </div>
                        <p class="text-xs text-slate-600">${optA.note || defaultOptA.note}</p>
                        
                        <div class="space-y-1.5 text-xs font-mono pt-1">
                            <div class="flex justify-between"><span class="text-slate-500">Extra Expedite Cost:</span> <span class="text-slate-900 font-semibold">+$${costA.toLocaleString()}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Expected Delay:</span> <span class="text-emerald-600 font-bold">+${optA.delayDays || 0}d</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Net Preserved ROI:</span> <span class="text-emerald-600 font-bold">${evalA.formattedBenefit}</span></div>
                        </div>

                        <div class="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-[11px] text-slate-700">
                            <span class="font-bold text-blue-700">Why Recommended:</span> Air transport completely eliminates assembly line shutdown penalties.
                        </div>
                    </div>

                    <button onclick="promptDecisionConfirm('${nameA.replace(/'/g, "\\'")}', '${(target.name || '').replace(/'/g, "\\'")} (${target.id || ''})', ${costA}, '${evalA.formattedBenefit}')" 
                        class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm">
                        Select Option A
                    </button>
                </div>

                <!-- Option B -->
                <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h4 class="text-sm font-bold text-slate-900">${nameB}</h4>
                            <span class="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-mono font-semibold">Secondary</span>
                        </div>
                        <p class="text-xs text-slate-600">${optB.note || defaultOptB.note}</p>
                        
                        <div class="space-y-1.5 text-xs font-mono pt-1">
                            <div class="flex justify-between"><span class="text-slate-500">Extra Supplier Cost:</span> <span class="text-slate-900 font-semibold">+$${costB.toLocaleString()}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Expected Delay:</span> <span class="text-amber-600 font-semibold">+${optB.delayDays || 0}d</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Net Preserved ROI:</span> <span class="text-emerald-600 font-bold">${evalB.formattedBenefit}</span></div>
                        </div>

                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                            <span class="font-bold text-slate-800">Trade-off:</span> Lower cost than air freight, but a partial line delay remains.
                        </div>
                    </div>

                    <button onclick="promptDecisionConfirm('${nameB.replace(/'/g, "\\'")}', '${(target.name || '').replace(/'/g, "\\'")} (${target.id || ''})', ${costB}, '${evalB.formattedBenefit}')" 
                        class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 transition-colors">
                        Select Option B
                    </button>
                </div>

                <!-- Option C -->
                <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h4 class="text-sm font-bold text-slate-900">${nameC}</h4>
                            <span class="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-mono font-medium">No Action</span>
                        </div>
                        <p class="text-xs text-slate-600">${optC.note || defaultOptC.note}</p>
                        
                        <div class="space-y-1.5 text-xs font-mono pt-1">
                            <div class="flex justify-between"><span class="text-slate-500">Extra Expedite Cost:</span> <span class="text-slate-900 font-semibold">$0</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Expected Delay:</span> <span class="text-rose-600 font-bold">+${optC.delayDays || 0}d</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Net Preserved ROI:</span> <span class="text-rose-600 font-bold font-mono">${evalC.formattedBenefit}</span></div>
                        </div>

                        <div class="bg-rose-50 p-3 rounded-xl border border-rose-200 text-[11px] text-rose-700">
                            <span class="font-bold">Penalty Exposure:</span> Full financial stockout penalty realized without mitigation.
                        </div>
                    </div>

                    <button onclick="promptDecisionConfirm('${nameC.replace(/'/g, "\\'")}', '${(target.name || '').replace(/'/g, "\\'")} (${target.id || ''})', 0, '${evalC.formattedBenefit}')" 
                        class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold text-xs rounded-lg border border-slate-200 transition-colors">
                        Select Option C
                    </button>
                </div>
            `;
        }

        function promptDecisionConfirm(actionTitle, shipmentName, cost, savings) {
            state.pendingExecution = { actionTitle, shipmentName, cost, savings };

            const detailsElem = document.getElementById('confirmModalDetails');
            if (detailsElem) {
                detailsElem.innerHTML = `
                    <div><span class="text-slate-400">Shipment:</span> ${shipmentName}</div>
                    <div><span class="text-slate-400">Selected Action:</span> ${actionTitle}</div>
                    <div><span class="text-slate-400">Extra Cost:</span> $${cost.toLocaleString()}</div>
                    <div><span class="text-slate-400">Estimated Net Benefit:</span> <span class="text-emerald-600 font-bold">${savings}</span></div>
                `;
            }

            const btn = document.getElementById('confirmExecuteBtn');
            if (btn) btn.onclick = executeConfirmedDecision;
            
            const modal = document.getElementById('decisionConfirmModal');
            if (modal) modal.classList.remove('hidden');
        }

        function closeConfirmModal() {
            const modal = document.getElementById('decisionConfirmModal');
            if (modal) modal.classList.add('hidden');
        }

        function executeConfirmedDecision() {
            closeConfirmModal();
            closeShipmentModal();
            const p = state.pendingExecution;
            if(!p) return;

            const now = new Date();
            const timestamp = now.toISOString().replace('T', ' ').substring(0, 16);

            const numericCost = typeof p.cost === 'number' ? p.cost : parseInt(String(p.cost).replace(/[^0-9]/g, '')) || 0;
            const numericSavings = parseInt(String(p.savings).replace(/[^0-9]/g, '')) || 0;

            state.decisionLogs.unshift({
                timestamp: timestamp,
                po: p.shipmentName,
                action: p.actionTitle,
                cost: p.cost === 0 ? '$0' : `+$${numericCost.toLocaleString()}`,
                savings: p.savings,
                rawCost: numericCost,
                rawSavings: numericSavings,
                status: 'Approved & Committed'
            });

            saveLogsToStorage();
            updateOverviewMetrics();
            renderDecisionHistory();
            switchTab('decision-history');
        }

        function handleTrackForm(event) {
            event.preventDefault();
            const query = document.getElementById('trackInput').value.trim().toUpperCase();
            if (!query) return;

            if (!state.shipments || state.shipments.length === 0) {
                state.shipments = getShipmentsDataset();
            }

            const matched = state.shipments.find(s => s.id.includes(query) || s.name.toUpperCase().includes(query));
            if (matched) {
                viewShipmentDetails(matched.id);
            } else {
                switchTab('shipments');
                const searchInput = document.getElementById('shipmentSearchInput');
                if (searchInput) {
                    searchInput.value = query;
                    applyShipmentFilters();
                }
            }
        }

        function renderShipmentsTable() {
            if (!state.shipments || state.shipments.length === 0) {
                state.shipments = getShipmentsDataset();
            }

            const tbody = document.getElementById('shipmentTableBody');
            if (!tbody) return;

            const riskFilter = document.getElementById('filterRisk')?.value || 'ALL';
            const searchQuery = document.getElementById('shipmentSearchInput')?.value.toLowerCase() || '';

            const filtered = state.shipments.filter(s => {
                const matchesRisk = riskFilter === 'ALL' || s.status === riskFilter;
                const matchesSearch = s.name.toLowerCase().includes(searchQuery) ||
                                      s.id.toLowerCase().includes(searchQuery) ||
                                      s.origin.toLowerCase().includes(searchQuery) ||
                                      s.dest.toLowerCase().includes(searchQuery) ||
                                      s.supplier.toLowerCase().includes(searchQuery);
                return matchesRisk && matchesSearch;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400 font-mono text-xs">No shipments found matching filter criteria.</td></tr>`;
                return;
            }

            tbody.innerHTML = filtered.map(s => {
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let badgeText = 'On Track';
                let delayDisplay = '0 Days';
                if (s.status === 'CRITICAL') {
                    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                    badgeText = 'Urgent';
                    delayDisplay = `+${s.delayDays} Days`;
                } else if (s.status === 'MODERATE') {
                    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
                    badgeText = 'Needs Attention';
                    delayDisplay = `+${s.delayDays} Days`;
                }

                return `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="py-3.5 px-4">
                            <div class="font-bold text-slate-900">${s.name}</div>
                            <div class="text-[10px] font-mono text-slate-400">PO: ${s.id}</div>
                        </td>
                        <td class="py-3.5 px-4 font-mono text-slate-600">${s.origin} → ${s.dest}</td>
                        <td class="py-3.5 px-4 text-slate-700 font-medium">${s.supplier}</td>
                        <td class="py-3.5 px-4 font-mono ${s.status === 'NORMAL' ? 'text-emerald-600' : 'text-rose-600 font-bold'}">${delayDisplay}</td>
                        <td class="py-3.5 px-4 font-mono text-slate-700 font-semibold">$${s.penalty.toLocaleString()}</td>
                        <td class="py-3.5 px-4"><span class="px-2.5 py-1 rounded border ${badgeClass} text-[10px] font-mono">${badgeText}</span></td>
                        <td class="py-3.5 px-4 text-right">
                            <button onclick="viewShipmentDetails('${s.id}')" class="px-3.5 py-1.5 ${s.status === 'CRITICAL' ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold'} text-xs rounded-lg transition-colors shadow-xs">
                                View Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function applyShipmentFilters() {
            renderShipmentsTable();
        }

        function renderDecisionHistory() {
            const tbody = document.getElementById('decisionHistoryTable');
            if (!tbody) return;

            if (state.decisionLogs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400 font-mono text-xs">No decisions recorded in log.</td></tr>`;
                return;
            }

            tbody.innerHTML = state.decisionLogs.map(log => `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-3.5 px-4 font-mono text-slate-500">${log.timestamp}</td>
                    <td class="py-3.5 px-4 font-bold text-slate-900">${log.po}</td>
                    <td class="py-3.5 px-4 text-slate-800 font-medium">${log.action}</td>
                    <td class="py-3.5 px-4 font-mono text-slate-600">${log.cost}</td>
                    <td class="py-3.5 px-4 font-mono text-emerald-600 font-bold">${log.savings}</td>
                    <td class="py-3.5 px-4">
                        <span class="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold">${log.status}</span>
                    </td>
                </tr>
            `).join('');
        }

        function clearDecisionLog() {
            state.decisionLogs = [];
            saveLogsToStorage();
            updateOverviewMetrics();
            renderDecisionHistory();
        }

        function initAnalyticsCharts() {
            const canvas1 = document.getElementById('roiChart');
            const canvas2 = document.getElementById('disruptionChart');
            if (!canvas1 || !canvas2 || typeof Chart === 'undefined') return;

            if (roiChartInstance) roiChartInstance.destroy();
            if (disruptionChartInstance) disruptionChartInstance.destroy();

            const totalCost = state.decisionLogs.reduce((sum, item) => sum + (Number(item.rawCost) || 0), 0);
            const totalSaved = state.decisionLogs.reduce((sum, item) => sum + (Number(item.rawSavings) || 0), 0);

            roiChartInstance = new Chart(canvas1.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Recorded decisions'],
                    datasets: [
                        { label: 'Intervention Cost ($)', data: [totalCost], backgroundColor: '#94a3b8', borderRadius: 6 },
                        { label: 'Estimated Benefit ($)', data: [totalSaved], backgroundColor: '#2563eb', borderRadius: 6 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#475569', font: { family: 'Inter', size: 11 } } } },
                    scales: {
                        x: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
                        y: { beginAtZero: true, ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } }
                    }
                }
            });

            const counts = ['CRITICAL', 'MODERATE', 'NORMAL'].map(status =>
                state.shipments.filter(shipment => shipment.status === status).length
            );
            disruptionChartInstance = new Chart(canvas2.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Critical', 'Moderate', 'Normal'],
                    datasets: [{ data: counts, backgroundColor: ['#e11d48', '#f59e0b', '#2563eb'], borderWidth: 0 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { color: '#475569', font: { family: 'Inter', size: 11 } } } }
                }
            });
        }

       window.onload = async function () {

            const isAuthenticated = await validateUserSession();

            if (!isAuthenticated) {
                return;
            }
            if (window.lucide) {
                lucide.createIcons();
           }

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/api/shipments"
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();

        const existingShipments = getShipmentsDataset();

        state.shipments = (Array.isArray(result.items) ? result.items : []).map((item) => {
            const existing = existingShipments.find(
                (shipment) => shipment.id === item.id
            ) || {};

            return {
                ...existing,
                id: item.id,
                name: item.product,
                origin: item.origin,
                dest: item.destination,
                supplier: item.supplier,
                status: item.status,
                delayDays: item.delay_days,
                penalty: item.penalty
            };
        });

        updateOverviewMetrics();
        switchTab("overview");

        console.log(
            "SupplyPrescript API connected:",
            state.shipments.length,
            "shipments loaded"
        );
    } catch (error) {
        console.error("Failed to load shipments:", error);

        state.shipments = getShipmentsDataset();
        updateOverviewMetrics();
        switchTab("overview");

        alert(
            "Backend data could not be loaded. " +
            "Check whether the API is running at port 8000."
        );
    }
};
