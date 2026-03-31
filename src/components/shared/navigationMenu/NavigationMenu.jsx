'use client'
import React, { useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PerfectScrollbar from "react-perfect-scrollbar";
import { FiSunrise } from "react-icons/fi";
import Menus from './Menus';
import { NavigationContext } from '@/contentApi/navigationProvider';

const NavigationManu = () => {
    const { navigationOpen, setNavigationOpen } = useContext(NavigationContext)
    const pathName = usePathname()
    useEffect(() => {
        setNavigationOpen(false)
    }, [pathName])
    return (
        <nav className={`nxl-navigation ${navigationOpen ? "mob-navigation-active" : ""}`} style={{ background: '#031035' }}>
            <style jsx global>{`
                .nxl-navigation, 
                .navbar-wrapper, 
                .navbar-content, 
                .nxl-navigation .m-header, 
                .nxl-header, 
                .header-wrapper, 
                .header-left, 
                .header-right, 
                .nxl-head-mobile-toggler,
                .nxl-head-mobile-toggler:hover,
                .hamburger-box {
                    background: #031035 !important;
                    background-color: #031035 !important;
                    border: none !important;
                }
                .nxl-navigation .nxl-link, 
                .nxl-navigation .nxl-mtext, 
                .nxl-navigation .nxl-micon,
                .nxl-navigation .nxl-arrow,
                .nxl-navigation .nxl-header h5 {
                    color: #ffffff !important;
                    font-weight: 500;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                /* Hide text only in minimenu state WHEN NOT HOVERED */
                html.minimenu .nxl-navigation:not(:hover) .nxl-mtext,
                html.minimenu .nxl-navigation:not(:hover) .nxl-arrow,
                html.minimenu .nxl-navigation:not(:hover) .card {
                    display: none !important;
                }
                /* Show text on hover even in minimenu */
                html.minimenu .nxl-navigation:hover .nxl-mtext,
                html.minimenu .nxl-navigation:hover .nxl-arrow {
                    display: inline-block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    color: #ffffff !important;
                }
                .nxl-navigation .nxl-item.active > .nxl-link {
                    color: #ffffff !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                .navbar-content .ps__rail-y {
                    background-color: transparent !important;
                }
                .nxl-header .header-left, .nxl-header .header-right {
                    border: none !important;
                }
                .nxl-header .header-left::after, .nxl-header .header-left::before {
                    display: none !important;
                }
                /* Remove vertical line and white gaps */
                .m-header::after, .nxl-header::after, .header-wrapper::after, .nxl-navigation::after {
                    display: none !important;
                }
                .b-brand {
                    border: none !important;
                }
                .nxl-submenu {
                    background: #031035 !important;
                }
                .nxl-submenu .nxl-link {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                /* Hover state for menu items */
                .nxl-navigation .nxl-item:hover > .nxl-link,
                .nxl-navigation .nxl-link:hover {
                    background-color: #1a2b5a !important; 
                    color: #ffffff !important;
                }
            `}</style>
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link href="/preview" className="b-brand">
                        {/* <!-- ========   change your logo hear   ============ --> */}
                        <Image width={140} height={40} src="/images/logo360.png" alt="logo" className="logo logo-lg" style={{ background: '#031035' }} />
                        <Image width={140} height={40} src="/images/logo-abbr.png" alt="logo" className="logo logo-sm" style={{ background: '#031035' }} />
                    </Link>
                </div>

                <div className={`navbar-content`}>
                    <PerfectScrollbar>
                        <ul className="nxl-navbar">
                            <Menus />
                        </ul>
                        <div style={{ height: "18px" }}></div>
                    </PerfectScrollbar>
                </div>
            </div>
            <div onClick={() => setNavigationOpen(false)} className={`${navigationOpen ? "nxl-menu-overlay" : ""}`}></div>
        </nav>
    )
}

export default NavigationManu