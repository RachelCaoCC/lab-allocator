import NavBar from '../components/nav/NavBar';
import { useState } from 'react';
import { useEffect } from 'react';
import * as helpers from "../utils/helperFunctions.js";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { mkConfig, generateCsv, download } from "export-to-csv";
import { json2csv } from 'json-2-csv';
import { create } from '@mui/material/styles/createTransitions.js';

function ManageTimetable(props){
    const [filteredTimetable, setFilteredData] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [activeView, setView] = useState(['HN1.23', 'HN1.24', 'N109', 'N111', 'N112', 'N113', 'N114', 'N115/6'])
    const [activeCourse, setCourseFilter] = useState(["All"])
    const [courseList, setCourseList] = useState(["All"])
    const csvConfig = mkConfig({ useKeysAsHeaders: true });
    const [createdTime, setTime] = useState(0);

    const updateData = async (data, course) => {
        if(course != "All"){
            setFilteredData(data.filter((tut) => activeView.includes(tut.location)).filter((tut) => tut.title == course))
        }else{
            setFilteredData(data.filter((tut) => activeView.includes(tut.location)))
        }
    }

    const saveTimetable = async () => {
        helpers.saveTimetable(timetable)
    }

    const filterByCourse = async (e) => {
        await setCourseFilter(e.target.value);
        updateData(timetable, e.target.value)
    }

    const toggleView = (room) => {
        var viewable = activeView;
        if(viewable.includes(room)){
            const rem = viewable.indexOf(room);
            viewable.splice(rem, 1)
        }else{
            viewable.push(room)
        }
        setView(viewable)
        updateData(timetable, activeCourse);
    }

    const updateTutorial = async (tutorial) => {
        var editedTutorial = await timetable.find((tuts) => tuts.id == tutorial.event.id)
        editedTutorial.startTime = tutorial.event.start.getHours() + ":" + (tutorial.event.start.getMinutes() == 0 ? "00" : "30")
        editedTutorial.endTime = tutorial.event.end.getHours() + ":" + (tutorial.event.end.getMinutes() == 0 ? "00" : "30")
        editedTutorial.daysOfWeek = tutorial.event.start.getDay().toString()
        updateData(timetable, activeCourse)
    }

    const initData = async (data) => {
        setTimetable(data)
        setCourseList(["All", ...new Set(data.map(item => item.title))].slice(0, -1))
        updateData(data, activeCourse)
    }

    const fetchPost = async () => {
        const data = await helpers.getRoomTimetables()
        setTime(data[1])
        initData(data[0])
        

    }

    useEffect(() => {fetchPost();}, [])

    const downloadFile = async () => {
        const fileData = await helpers.numToDay(timetable).then(data => {
            var blob = new Blob([json2csv(data, {excludeKeys: ["backgroundColor", "durationEditable", "borderColor", "overlap", "editable", "daysOfWeek"]})], { type: "csv" });
            var a = document.createElement('a');
            a.download = "timetable.csv";
            a.href = URL.createObjectURL(blob);
            a.dataset.downloadurl = ["csv", a.download, a.href].join(':');
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
        })


    }

    return(
        <div className='manageTimetable'>
            <NavBar navigate={props.navigate} tab={'manage-data'}></NavBar>


            <div className='timetable-calendar'>
                <div className='course-filter'>
                    <label for="course-filter">Filter By Course</label>
                    <select id="filter-by-course" onChange={filterByCourse}>
                        {courseList.map((code) => (
                            <option value={code}>{code}</option>
                        ))}
                    </select>
                    
                </div>
                
            
                <FullCalendar
                plugins={[ timeGridPlugin, interactionPlugin ]}
                initialView="timeGridWeek"
                weekends={false}
                slotMinTime={"08:00:00"}
                slotMaxTime={"21:00:00"}
                initialDate={"2024-01-01"}
                dayHeaderFormat={{ weekday: 'short' }}
                height={"auto"}
                customButtons={
                    { 
                        HN123: {text: 'HN1.23', click: function() { toggleView("HN1.23") }},
                        HN124: {text: 'HN1.24', click: function() { toggleView("HN1.24") }},
                        N109: {text: 'N109', click: function() { toggleView("N109") }},
                        N111: {text: 'N111', click: function() { toggleView("N111") }},
                        N112: {text: 'N112', click: function() { toggleView("N112") }},
                        N113: {text: 'N113', click: function() { toggleView("N113") }},
                        N114: {text: 'N114', click: function() { toggleView("N114") }},
                        N1156: {text: 'N115/6', click: function() { toggleView("N115/6") }},
                    }}
                headerToolbar={{
                    start: '', // will normally be on the left. if RTL, will be on the right
                    center: 'HN123 HN124 N109 N111 N112 N113 N114 N1156',
                    end: '' // will normally be on the right. if RTL, will be on the left
                }}
                allDaySlot={false}
                events={filteredTimetable}
                eventDrop={function(event){updateTutorial(event)}}
                eventClick={function(event){}}
                eventOverlap={function(still, moving){return !(still._def.extendedProps.location === moving._def.extendedProps.location)}}
                />
            </div>
            <div className='bottom-bar'>
                <div className='manage-timetable-buttons'>
                    <button className='timetable-save' onClick={saveTimetable}>Save</button>
                    <button className='timetable-save' onClick={downloadFile}>Download</button>
                </div>
                <p className='created'><b>Timetable Created</b> {createdTime}</p>
            </div>
            
            
        </div>
    );
}
export default ManageTimetable;