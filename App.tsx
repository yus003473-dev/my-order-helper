
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Customer, Order, ActionLog, AppBackup } from './types.ts';
import { ProductManager } from './components/ProductManager.tsx';
import { OrderManager } from './components/OrderManager.tsx';
import { CustomerManager } from './components/CustomerManager.tsx';
import { DesktopGuide } from './components/DesktopGuide.tsx';
import { 
  LayoutDashboard, ShoppingBag, Users, Monitor, HardDrive, 
  DownloadCloud, Save, Upload, ShieldCheck, Box, Zap
} from 'lucide-react';

const APP_VERSION = "2.7.0-DesktopReady";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'customers' | 'desktop'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem('psh_products');
    const savedCustomers = localStorage.getItem('psh_customers');
    const savedOrders = localStorage.getItem('psh_orders');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    // 监听安装完成事件
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });
  }, []);

  useEffect(() => localStorage.setItem('psh_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('psh_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('psh_orders', JSON.stringify(orders)), [orders]);

  const addLog = useCallback((message: string, type: ActionLog['type'] = 'INFO') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type
    }, ...prev].slice(0, 50));
  }, []);

  const exportBackup = () => {
    const data: AppBackup = {
      products,
      customers,
      orders,
      version: APP_VERSION,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `接龙助手全量备份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addLog("已下载系统备份文件到本地", "SUCCESS");
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm("确定恢复备份吗？这将覆盖当前数据。")) {
          setProducts(data.products || []);
          setCustomers(data.customers || []);
          setOrders(data.orders || []);
          addLog("本地数据恢复成功", "SUCCESS");
        }
      } catch (err) {
        addLog("备份文件解析失败", "ERROR");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" />
      
      <aside className="w-full md:w-72 bg-slate-950 text-white flex-shrink-0 p-8 flex flex-col border-r border-white/5 no-print">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/30">
            <Monitor className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl leading-tight tracking-tight">女王接龙助手</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Desktop Ready</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'orders', icon: LayoutDashboard, label: '订单处理中心' },
            { id: 'products', icon: ShoppingBag, label: '商品规格库' },
            { id: 'customers', icon: Users, label: '客户档案' },
            { id: 'desktop', icon: Box, label: '安装桌面版' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.25rem] transition-all group ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-600 group-hover:text-indigo-400'}`} />
                <span className="font-bold text-sm">{tab.label}</span>
              </div>
              {activeTab === tab.id && <Zap className="w-3 h-3 fill-white" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
          {isInstallable && (
            <button 
              onClick={handleInstall} 
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white py-4 rounded-2xl text-xs font-black transition-all shadow-xl shadow-indigo-500/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <DownloadCloud className="w-4 h-4 animate-bounce" /> 一键安装桌面应用
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={exportBackup} className="flex flex-col items-center p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
              <Save className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-2 text-slate-500 font-black uppercase">Backup</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
              <Upload className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] mt-2 text-slate-500 font-black uppercase">Restore</span>
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Privacy Secured
            </div>
            <p className="text-[9px] text-slate-600 leading-relaxed italic">数据仅存储在您的本地浏览器中，绝不上传至任何云端服务器。</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 no-print bg-slate-50">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {activeTab === 'orders' ? '订单处理中心' : 
               activeTab === 'products' ? '商品及规格配置' : 
               activeTab === 'customers' ? '客户地址档案' : '桌面版本安装指引'}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black rounded uppercase">{APP_VERSION}</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">System Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-200 rounded-2xl">
             <HardDrive className="w-4.5 h-4.5 text-indigo-500" />
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Database Mode</span>
               <span className="text-[11px] font-bold text-slate-700">100% Local Offline</span>
             </div>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto">
          {activeTab === 'orders' && (
            <OrderManager 
              products={products} 
              customers={customers} 
              orders={orders} 
              setOrders={setOrders}
              logs={logs}
              addLog={addLog}
            />
          )}
          {activeTab === 'products' && <ProductManager products={products} setProducts={setProducts} />}
          {activeTab === 'customers' && <CustomerManager customers={customers} setCustomers={setCustomers} />}
          {activeTab === 'desktop' && <DesktopGuide />}
        </div>
      </main>
    </div>
  );
};

export default App;
