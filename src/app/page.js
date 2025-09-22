import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import SiteOverviewStatistics from '@/components/widgetsStatistics/SiteOverviewStatistics'
import PaymentRecordChart from '@/components/widgetsCharts/PaymentRecordChart'
import LeadsOverviewChart from '@/components/widgetsCharts/LeadsOverviewChart'
import TasksOverviewChart from '@/components/widgetsCharts/TasksOverviewChart'
import Project from '@/components/widgetsList/Project'
import Schedule from '@/components/widgetsList/Schedule'
import SalesMiscellaneous from '@/components/widgetsMiscellaneous/SalesMiscellaneous'
import LatestLeads from '@/components/widgetsTables/LatestLeads'
import TeamProgress from '@/components/widgetsList/Progress'
import { projectsDataTwo } from '@/utils/fackData/projectsDataTwo'
import DuplicateLayout from './duplicateLayout'
import Image from 'next/image'
import Link from 'next/link'
import LoginForm from '@/components/authentication/LoginForm'

const Home = () => {
  return (
    <DuplicateLayout>
      <PageHeader >
        <PageHeaderDate /> 
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          <SiteOverviewStatistics />
          <PaymentRecordChart />
          <SalesMiscellaneous isFooterShow={true} dataList={projectsDataTwo} />
          <TasksOverviewChart />
          <LeadsOverviewChart chartHeight={315} />
          <LatestLeads title={"Latest Leads"} />
          <Schedule title={"Upcoming Schedule"} />
          <Project cardYSpaceClass="hrozintioal-card" borderShow={true} title="Project Status" />
          <TeamProgress title={"Team Progress"} footerShow={true} />
        </div>
      </div>
    </DuplicateLayout>

    // <main className="auth-cover-wrapper">
    //         <div className="auth-cover-content-inner">
    //             <div className="auth-cover-content-wrapper">
    //                 <div className="auth-img">
    //                     <Image width={600} height={600} sizes='100vw' src="/images/auth/auth-cover-login-bg.svg" alt="img" className="img-fluid" />
    //                 </div>
    //             </div>
    //         </div>
    //         <div className="auth-cover-sidebar-inner">
    //             <div className="auth-cover-card-wrapper">
    //                 <div className="auth-cover-card p-sm-5">
    //                     <div className="wd-50 mb-5">
    //                         <img src="/images/logo-abbr.png" alt='img' className="img-fluid" />
    //                     </div>
    //                     <LoginForm registerPath={"/authentication/register/cover"} resetPath={"/authentication/reset/cover"} />
    //                 </div>
    //             </div>
    //         </div>
    //     </main>
  )
}

export default Home