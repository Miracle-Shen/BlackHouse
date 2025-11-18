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
            
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2">
                <div className="flex justify-around max-w-md mx-auto">
                    <button
                        onClick={() => handleTabClick('home', '/')}
                        className={`p-2 text-sm ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        Home
                    </button>
                    
                    <button
                        onClick={() => handleTabClick('publish', '/publish')}
                        className={`p-2 text-sm ${activeTab === 'publish' ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        +
                    </button>
                    
                    <button
                        onClick={() => handleTabClick('profile', '/user')}
                        className={`p-2 text-sm ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        Profile
                    </button>
                </div>
            </nav>
        </div>
    )
}

export default Layout
