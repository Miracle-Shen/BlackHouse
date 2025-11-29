import { Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"

const Layout = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('home')

    const handleTabClick = (tab: string, path: string) => {
        setActiveTab(tab)
        navigate(path)
    }

    return (
        <div className="min-h-screen pb-16">
            <main>
                <Outlet /> 
            </main>
            
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-1">
                <div className="flex justify-around max-w-md mx-auto">
                    <button
                        onClick={() => handleTabClick('home', '/')}
                        className={`w-24 p-2 text-sm ${activeTab === 'home' ? 'text-red-600' : 'text-black'}`}
                    >
                        首页
                    </button>
                    
                    <button
                        onClick={() => handleTabClick('edit', '/edit')}
                        className={`w-24 p-2 text-sm ${activeTab === 'edit' ? 'text-red-600' : 'text-black'}`}
                    >
                        +
                    </button>
                    
                    <button
                        onClick={() => handleTabClick('mine', '/mine')}
                        className={`w-24 p-2 text-sm ${activeTab === 'mine' ? 'text-red-600' : 'text-black'}`}
                    >
                        我的
                    </button>
                </div>
            </nav>
        </div>
    )
}

export default Layout
