// 'use client'
// import React, { useState } from 'react'
// import CardHeader from '@/components/shared/CardHeader'
// import Pagination from '@/components/shared/Pagination'
// import { FiMoreVertical } from 'react-icons/fi'
// import CardLoader from '@/components/shared/CardLoader'
// import useCardTitleActions from '@/hooks/useCardTitleActions'
// import axios from 'axios'

// const LeadsStatus = ({ title }) => {
//     const { isRemoved, isExpanded, handleExpand, handleDelete } = useCardTitleActions();
//     const [dataRows, setDataRows] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get("http://localhost:5000/v1/fetch-report");
//             const raw = Array.isArray(response.data) ? response.data : [response.data];

//             console.log("Raw Data:", raw);
            
//             const cleanedData = raw.map((item, index) => {
//                 const clean = (val) => (val === "N/A" || val === undefined ? "0" : val);
//                 const cleanedItem = {};
//                 Object.entries(item).forEach(([key, val]) => {
//                     cleanedItem[key] = clean(val);
//                 });
//                 return { id: index + 1, ...cleanedItem };
//             });

//             console.log("Cleaned Data:", cleanedData);

//             setDataRows(cleanedData);
//         } catch (error) {
//             console.error("Fetch error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (isRemoved) return null;

//     // Extract headers from first item
//     const headers = dataRows.length > 0 ? Object.keys(dataRows[0]).filter(h => h !== 'id') : [];

//     return (
//         <div className="col-lg-12">
//             <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""}`}>
//                 <CardHeader title={title} refresh={fetchData} remove={handleDelete} expanded={handleExpand} />

//                 <div className="card-body">
//                     <button onClick={fetchData} className="btn btn-primary mb-3">Load Full Report</button>

//                     <div className="table-responsive" style={{ maxHeight: '500px', overflow: 'auto' }}>
//                         <table className="table table-bordered table-hover mb-0 text-nowrap">
//                             <thead className="table-light">
//                                 <tr>
//                                     <th>#</th>
//                                     {headers.map((header, i) => (
//                                         <th key={i}>{header}</th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {loading ? (
//                                     <tr><td colSpan={headers.length + 1} className="text-center py-4">Loading...</td></tr>
//                                 ) : dataRows.length === 0 ? (
//                                     <tr><td colSpan={headers.length + 1} className="text-center py-4">Click "Load Full Report" to fetch data</td></tr>
//                                 ) : (
//                                     dataRows.map((row) => (
//                                         <tr key={row.id}>
//                                             <td>{row.id}</td>
//                                             {headers.map((header, i) => (
//                                                 <td key={i}>{row[header]}</td>
//                                             ))}
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 <div className="card-footer">
//                     <Pagination />
//                 </div>
//                 <CardLoader refreshKey={loading} />
//             </div>
//         </div>
//     )
// }

// export default LeadsStatus;


'use client'
import React, { useState, useEffect } from 'react'
import CardHeader from '@/components/shared/CardHeader'
import Pagination from '@/components/shared/Pagination'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import axios from 'axios'

const LeadsStatus = ({ title, initialData = [], progressFullHeight = false }) => {
    const { isRemoved, isExpanded, handleExpand, handleDelete } = useCardTitleActions();
    const [dataRows, setDataRows] = useState(initialData);
    const [loading, setLoading] = useState(false);

    // Optional: update local data if initialData changes
    useEffect(() => {
        setDataRows(initialData);
    }, [initialData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/v1/fetch-report");
            const raw = Array.isArray(response.data) ? response.data : [response.data];

            const clean = (val) => (val === "N/A" || val === undefined ? "0" : val);
            const cleanedData = raw.map((item, index) => {
                const cleanedItem = {};
                Object.entries(item).forEach(([key, val]) => {
                    cleanedItem[key] = clean(val);
                });
                return { id: index + 1, ...cleanedItem };
            });

            setDataRows(cleanedData);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (isRemoved) return null;

    const headers = dataRows.length > 0 ? Object.keys(dataRows[0]).filter(h => h !== 'id') : [];

    return (
        <div className="col-lg-12">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""}`}>
                <CardHeader title={title} refresh={fetchData} remove={handleDelete} expanded={handleExpand} />

                <div className={`card-body ${progressFullHeight ? 'h-100' : ''}`}>
                    <button onClick={fetchData} className="btn btn-primary mb-3">Load Full Report</button>

                    <div className="table-responsive" style={{ maxHeight: '500px', overflow: 'auto' }}>
                        <table className="table table-bordered table-hover mb-0 text-nowrap">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    {headers.map((header, i) => (
                                        <th key={i}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={headers.length + 1} className="text-center py-4">Loading...</td>
                                    </tr>
                                ) : dataRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={headers.length + 1} className="text-center py-4">Click "Load Full Report" to fetch data</td>
                                    </tr>
                                ) : (
                                    dataRows.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.id}</td>
                                            {headers.map((header, i) => (
                                                <td key={i}>{row[header]}</td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card-footer">
                    <Pagination />
                </div>
                <CardLoader refreshKey={loading} fullHeight={progressFullHeight} />
            </div>
        </div>
    )
}

export default LeadsStatus;
