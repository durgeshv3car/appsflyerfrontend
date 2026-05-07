'use client'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FiAlignLeft, FiArrowLeft, FiArrowRight, FiMaximize, FiMinimize, FiMoon, FiSun, } from "react-icons/fi";
import ProfileModal from './ProfileModal';
import { NavigationContext } from '@/contentApi/navigationProvider';


const Header = () => {
    const { navigationOpen, setNavigationOpen } = useContext(NavigationContext)
    const [openMegaMenu, setOpenMegaMenu] = useState(false)
    const [navigationExpend, setNavigationExpend] = useState(false)
    const miniButtonRef = useRef(null);
    const expendButtonRef = useRef(null);


    useEffect(() => {
        if (openMegaMenu) {
            document.documentElement.classList.add("nxl-lavel-mega-menu-open")
        }
        else {
            document.documentElement.classList.remove("nxl-lavel-mega-menu-open")
        }
    }, [openMegaMenu])

    const handleThemeMode = (type) => {
        if (type === "dark") {
            document.documentElement.classList.add("app-skin-dark")
            localStorage.setItem("skinTheme", "dark");
        }
        else {
            document.documentElement.classList.remove("app-skin-dark")
            localStorage.setItem("skinTheme", "light");
        }
    }

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const isMini = width >= 1025 && width <= 1400;
            document.documentElement.classList.toggle('minimenu', isMini);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Default state
        document.documentElement.classList.add('minimenu');
        setNavigationExpend(false);
        handleThemeMode(localStorage.getItem("skinTheme"));

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigationExpendUp = (e, pram) => {
        e.preventDefault()
        if (pram === "show") {
            setNavigationExpend(true);
            document.documentElement.classList.remove('minimenu')
        }
        else {
            setNavigationExpend(false);
            document.documentElement.classList.add('minimenu')
        }
    }

    const fullScreenMaximize = () => {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }

        document.documentElement.classList.add("fsh-infullscreen")
        document.querySelector("body").classList.add("full-screen-helper")

    };
    const fullScreenMinimize = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { 
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        document.documentElement.classList.remove("fsh-infullscreen")
        document.querySelector("body").classList.remove("full-screen-helper")
    }

    return (
        <header className="nxl-header" style={{ background: '#031035', color: '#fff' }}>
            <div className="header-wrapper">
                {/* <!--! [Start] Header Left !--> */}
                <div className="header-left d-flex align-items-center gap-4" style={{ background: '#031035' }}>
                    {/* <!--! [Start] nxl-head-mobile-toggler !--> */}
                    <div className="d-lg-none">
                        <a href="#" className="nxl-head-mobile-toggler" onClick={(e) => {e.preventDefault(), setNavigationOpen(true)}} id="mobile-collapse" style={{ background: '#031035', color: '#fff' }}>
                            <div className={`hamburger hamburger--arrowturn ${navigationOpen ? "is-active" : ""}`} style={{ background: '#031035' }}>
                                <div className="hamburger-box">
                                    <div className="hamburger-inner" style={{ backgroundColor: '#fff' }}></div>
                                </div>
                            </div>
                        </a>
                    </div>
                    
                    {/* <!--! [Start] nxl-navigation-toggle !--> */}
                    <div className="nxl-navigation-toggle d-none d-lg-flex">
                        <a href="#" onClick={(e) => handleNavigationExpendUp(e, navigationExpend ? "hide" : "show")} id="menu-mini-button" style={{ color: '#fff' }}>
                            {navigationExpend ? <FiArrowRight size={24} /> : <FiAlignLeft size={24} />}
                        </a>
                    </div>
                    {/* <!--! [End] nxl-navigation-toggle !--> */}
                    {/* <!--! [End] nxl-lavel-mega-menu-toggle !-->
                    <!--! [Start] nxl-lavel-mega-menu !--> */}
                    <div className="nxl-drp-link nxl-lavel-mega-menu">
                        <div className="nxl-lavel-mega-menu-toggle d-flex d-lg-none">
                            <a href="#" onClick={(e) => {e.preventDefault(), setOpenMegaMenu(false)}} id="nxl-lavel-mega-menu-hide">
                                <i className="me-2"><FiArrowLeft /></i>
                                <span>Back</span>
                            </a>
                        </div>
                        {/* <!--! [Start] nxl-lavel-mega-menu-wrapper !--> */}
           
                    </div>
                </div>
                {/* <!--! [End] Header Left !-->
                <!--! [Start] Header Right !--> */}
                <div className="header-right ms-auto">
                    <div className="d-flex align-items-center">
           
                        <ProfileModal />
                    </div>
                </div>
       
            </div>
        </header>
    )
}

export default Header