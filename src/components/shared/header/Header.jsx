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
            const newWindowWidth = window.innerWidth;
            if (newWindowWidth <= 1024) {
                document.documentElement.classList.remove('minimenu');
                document.querySelector('.navigation-down-1600').style.display = 'none';
            }
            else if (newWindowWidth >= 1025 && newWindowWidth <= 1400) {
                document.documentElement.classList.add('minimenu');
                document.querySelector('.navigation-up-1600').style.display = 'none';
                document.querySelector('.navigation-down-1600').style.display = 'block';
            }
            else {
                document.documentElement.classList.remove('minimenu');
                document.querySelector('.navigation-up-1600').style.display = 'block';
                document.querySelector('.navigation-down-1600').style.display = 'none';
            }
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        // Enforce mini menu by default as requested
        document.documentElement.classList.add('minimenu');
        setNavigationExpend(false);

        const savedSkinTheme = localStorage.getItem("skinTheme");
        handleThemeMode(savedSkinTheme)

        return () => {
            window.removeEventListener('resize', handleResize);
        };
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

    const handleNavigationExpendDown = (e, pram) => {
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
                    <a href="#" className="nxl-head-mobile-toggler" onClick={(e) => {e.preventDefault(), setNavigationOpen(true)}} id="mobile-collapse" style={{ background: '#031035', color: '#fff' }}>
                        <div className={`hamburger hamburger--arrowturn ${navigationOpen ? "is-active" : ""}`} style={{ background: '#031035' }}>
                            <div className="hamburger-box">
                                <div className="hamburger-inner" style={{ backgroundColor: '#fff' }}></div>
                            </div>
                        </div>
                    </a>
                    {/* <!--! [Start] nxl-head-mobile-toggler !-->
                    <!--! [Start] nxl-navigation-toggle !--> */}
                    <div className="nxl-navigation-toggle navigation-up-1600">
                        <a href="#" onClick={(e) => handleNavigationExpendUp(e, "show")} id="menu-mini-button" ref={miniButtonRef} style={{ display: navigationExpend ? "none" : "block", color: '#fff' }}>
                            <FiAlignLeft size={24} />
                        </a>
                        <a href="#" onClick={(e) => handleNavigationExpendUp(e, "hide")} id="menu-expend-button" ref={expendButtonRef} style={{ display: navigationExpend ? "block" : "none", color: '#fff' }}>
                            <FiArrowRight size={24} />
                        </a>
                    </div>
                    <div className="nxl-navigation-toggle navigation-down-1600">
                        <a href="#" onClick={(e) => handleNavigationExpendDown(e, "hide")} id="menu-mini-button" ref={miniButtonRef} style={{ display: navigationExpend ? "block" : "none", color: '#fff' }}>
                            <FiAlignLeft size={24} />
                        </a>
                        <a href="#" onClick={(e) => handleNavigationExpendDown(e, "show")} id="menu-expend-button" ref={expendButtonRef} style={{ display: navigationExpend ? "none" : "block", color: '#fff' }}>
                            <FiArrowRight size={24} />
                        </a>
                    </div>
                    {/* <!--! [End] nxl-navigation-toggle !-->
                    <!--! [Start] nxl-lavel-mega-menu-toggle !--> */}
                    <div className="nxl-lavel-mega-menu-toggle d-flex d-lg-none">
                        <a href="#" onClick={(e) => {e.preventDefault(), setOpenMegaMenu(true)}} id="nxl-lavel-mega-menu-open">
                            <FiAlignLeft size={24} />
                        </a>
                    </div>
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