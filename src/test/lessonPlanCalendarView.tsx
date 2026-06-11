// import React, { useState, useMemo, useCallback } from 'react'
// import {
//   format,
//   addDays,
//   subDays,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   isSameMonth,
//   isSameDay,
//   addMonths,
//   subMonths,
//   parseISO,
//   setHours,
//   setMinutes,
//   isWithinInterval,
//   startOfDay,
//   getHours,
// } from 'date-fns'
// import {
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Filter,
//   Plus,
//   FileText,
//   Clock,
//   User,
//   MoreVertical,
//   X,
//   Edit2,
//   Trash2,
//   Copy,
//   Send,
//   LayoutGrid,
//   Paperclip,
//   BookOpen,
//   GraduationCap,
//   Menu,
// } from 'lucide-react'

// const SUBJECT_COLORS = {
//   Mathematics: {
//     bg: 'bg-blue-50',
//     border: 'border-blue-200',
//     text: 'text-blue-700',
//     solid: 'bg-blue-500',
//     eventBg: 'bg-blue-100 hover:bg-blue-200',
//   },
//   Science: {
//     bg: 'bg-emerald-50',
//     border: 'border-emerald-200',
//     text: 'text-emerald-700',
//     solid: 'bg-emerald-500',
//     eventBg: 'bg-emerald-100 hover:bg-emerald-200',
//   },
//   English: {
//     bg: 'bg-purple-50',
//     border: 'border-purple-200',
//     text: 'text-purple-700',
//     solid: 'bg-purple-500',
//     eventBg: 'bg-purple-100 hover:bg-purple-200',
//   },
//   History: {
//     bg: 'bg-amber-50',
//     border: 'border-amber-200',
//     text: 'text-amber-700',
//     solid: 'bg-amber-500',
//     eventBg: 'bg-amber-100 hover:bg-amber-200',
//   },
// }

// const STATUS_COLORS = {
//   Draft: 'bg-slate-200 text-slate-600',
//   Published: 'bg-green-100 text-green-700',
//   'Needs Review': 'bg-orange-100 text-orange-700',
// }

// const VIEWS = {
//   MONTH: 'month',
//   WEEK: 'week',
//   DAY: 'day',
// }

// const today = new Date()
// const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }) // Start week on Monday

// // Base hours for the calendar day view
// const START_HOUR = 8 // 8 AM
// const END_HOUR = 17 // 5 PM
// const HOURS = Array.from(
//   { length: END_HOUR - START_HOUR + 1 },
//   (_, i) => START_HOUR + i
// )

// const initialEvents = [
//   {
//     id: 1,
//     title: 'Algebra: Quadratic Equations',
//     subject: 'Mathematics',
//     classGroup: 'Grade 10-A',
//     teacher: 'Sarah Jenkins',
//     start: setMinutes(setHours(addDays(currentWeekStart, 0), 9), 0), // Mon 9:00 AM
//     end: setMinutes(setHours(addDays(currentWeekStart, 0), 10), 30), // Mon 10:30 AM
//     status: 'Published',
//     hasAttachment: true,
//     summary:
//       'Introduction to standard form and finding roots using the factoring method.',
//     content:
//       '<p>Students will be able to identify standard quadratic forms and find roots using the factoring method. We will cover ax² + bx + c = 0.</p><ul><li>Warm up exercise (15m)</li><li>Lecture on factoring (30m)</li><li>Group practice (45m)</li></ul>',
//   },
//   {
//     id: 2,
//     title: 'Photosynthesis Lab',
//     subject: 'Science',
//     classGroup: 'Grade 9-B',
//     teacher: 'Mark Roberts',
//     start: setMinutes(setHours(addDays(currentWeekStart, 1), 11), 0), // Tue 11:00 AM
//     end: setMinutes(setHours(addDays(currentWeekStart, 1), 13), 0), // Tue 1:00 PM
//     status: 'Draft',
//     hasAttachment: false,
//     summary: 'Lab experiment observing oxygen production in Elodea plants.',
//     content:
//       '<p>Set up lab stations before class. Ensure safety goggles are available.</p>',
//   },
//   {
//     id: 3,
//     title: 'Shakespeare: Macbeth Act 1',
//     subject: 'English',
//     classGroup: 'Grade 11-C',
//     teacher: 'Emily Chen',
//     start: setMinutes(setHours(addDays(currentWeekStart, 2), 10), 0), // Wed 10:00 AM
//     end: setMinutes(setHours(addDays(currentWeekStart, 2), 11), 0), // Wed 11:00 AM
//     status: 'Published',
//     hasAttachment: true,
//     summary: 'Character analysis of Macbeth and the Witches.',
//     content:
//       '<p>Read through Scene 1 and 2. Discuss the motif of unnatural elements.</p>',
//   },
//   {
//     id: 4,
//     title: 'World War II Causes',
//     subject: 'History',
//     classGroup: 'Grade 10-A',
//     teacher: 'David Kim',
//     start: setMinutes(setHours(addDays(currentWeekStart, 3), 14), 0), // Thu 2:00 PM
//     end: setMinutes(setHours(addDays(currentWeekStart, 3), 15), 30), // Thu 3:30 PM
//     status: 'Needs Review',
//     hasAttachment: true,
//     summary: 'Analyzing the Treaty of Versailles and rise of totalitarianism.',
//     content:
//       '<p>Review document based questions regarding the economic state of Germany in 1930s.</p>',
//   },
//   {
//     id: 5,
//     title: 'Geometry: Triangles',
//     subject: 'Mathematics',
//     classGroup: 'Grade 8-B',
//     teacher: 'Sarah Jenkins',
//     start: setMinutes(setHours(addDays(currentWeekStart, 4), 9), 0), // Fri 9:00 AM
//     end: setMinutes(setHours(addDays(currentWeekStart, 4), 10), 0), // Fri 10:00 AM
//     status: 'Published',
//     hasAttachment: false,
//     summary: 'Properties of isosceles and equilateral triangles.',
//     content: '<p>Worksheet practice on calculating missing angles.</p>',
//   },
// ]

// const EventDrawer = ({ event, isOpen, onClose }) => {
//   if (!event) return null

//   const colors = SUBJECT_COLORS[event.subject] || {
//     bg: 'bg-slate-50',
//     border: 'border-slate-200',
//     text: 'text-slate-700',
//     solid: 'bg-slate-500',
//   }

//   return (
//     <>
//       <div
//         className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
//           isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         onClick={onClose}
//       />

//       <div
//         className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
//           isOpen ? 'translate-x-0' : 'translate-x-full'
//         }`}
//       >
//         <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
//           <div>
//             <div className="flex items-center gap-2 mb-2">
//               <span
//                 className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//                   STATUS_COLORS[event.status]
//                 }`}
//               >
//                 {event.status}
//               </span>
//               <span
//                 className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border border-opacity-50 ${colors.border}`}
//               >
//                 {event.subject}
//               </span>
//             </div>
//             <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
//               {event.title}
//             </h2>
//             <p className="text-sm text-slate-500 flex items-center gap-2">
//               <Clock size={14} />
//               {format(event.start, 'MMM d')} • {format(event.start, 'h:mm a')} -{' '}
//               {format(event.end, 'h:mm a')}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
//               <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
//                 <GraduationCap size={12} /> Class/Grade
//               </span>
//               <span className="text-sm font-medium text-slate-800">
//                 {event.classGroup}
//               </span>
//             </div>
//             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
//               <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
//                 <User size={12} /> Teacher
//               </span>
//               <span className="text-sm font-medium text-slate-800">
//                 {event.teacher}
//               </span>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
//               <BookOpen size={16} className="text-blue-500" /> Lesson Content
//             </h3>
//             <div
//               className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-4 shadow-sm prose prose-sm max-w-none"
//               dangerouslySetInnerHTML={{ __html: event.content }}
//             />
//           </div>

//           {event.hasAttachment && (
//             <div>
//               <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
//                 <Paperclip size={16} className="text-blue-500" /> Attachments
//               </h3>
//               <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer group">
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`w-10 h-10 rounded bg-red-50 flex items-center justify-center text-red-500`}
//                   >
//                     <FileText size={20} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition">
//                       Worksheet_Final.pdf
//                     </p>
//                     <p className="text-xs text-slate-400">1.2 MB</p>
//                   </div>
//                 </div>
//                 <button className="text-slate-400 hover:text-blue-600 px-3">
//                   <Copy size={16} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
//           <button className="p-2 text-slate-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg">
//             <Trash2 size={20} />
//           </button>
//           <div className="flex gap-2">
//             <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-2">
//               <Edit2 size={16} /> Edit
//             </button>
//             <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm shadow-blue-200 flex items-center gap-2">
//               <Send size={16} />{' '}
//               {event.status === 'Published' ? 'Unpublish' : 'Publish'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// const WeekView = ({ currentDate, events, onSelectEvent, onSelectSlot }) => {
//   const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
//   const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)) // Mon-Fri

//   // Helper to calculate position and height for events based on time
//   const getEventStyles = (event) => {
//     const startHour = event.start.getHours()
//     const startMinutes = event.start.getMinutes()
//     const endHour = event.end.getHours()
//     const endMinutes = event.end.getMinutes()

//     const topMinutes = (startHour - START_HOUR) * 60 + startMinutes
//     const durationMinutes =
//       (endHour - startHour) * 60 + (endMinutes - startMinutes)

//     return {
//       top: `${(topMinutes / ((END_HOUR - START_HOUR + 1) * 60)) * 100}%`,
//       height: `${
//         (durationMinutes / ((END_HOUR - START_HOUR + 1) * 60)) * 100
//       }%`,
//     }
//   }

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//       {/* Header Row (Days) */}
//       <div className="flex border-b border-slate-200 bg-slate-50">
//         <div className="w-16 flex-shrink-0 border-r border-slate-200"></div>
//         {days.map((day, i) => (
//           <div
//             key={i}
//             className="flex-1 min-w-[120px] p-3 text-center border-r border-slate-200 last:border-r-0"
//           >
//             <p className="text-xs font-semibold text-slate-500 uppercase">
//               {format(day, 'EEE')}
//             </p>
//             <p
//               className={`text-lg font-bold mt-0.5 ${
//                 isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-800'
//               }`}
//             >
//               {format(day, 'd')}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Time Grid */}
//       <div className="flex-1 overflow-y-auto relative flex min-h-[600px]">
//         {/* Time Column */}
//         <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10">
//           {HOURS.map((hour) => (
//             <div
//               key={hour}
//               className="h-16 border-b border-slate-100 flex items-start justify-end pr-2 pt-1"
//             >
//               <span className="text-xs text-slate-400 font-medium">
//                 {format(setHours(new Date(), hour), 'ha')}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* Day Columns */}
//         <div className="flex flex-1 relative">
//           {/* Horizontal Grid Lines */}
//           <div className="absolute inset-0 pointer-events-none">
//             {HOURS.map((hour) => (
//               <div
//                 key={hour}
//                 className="h-16 border-b border-slate-100/50 w-full"
//               ></div>
//             ))}
//           </div>

//           {/* Day Slots */}
//           {days.map((day, dayIdx) => {
//             const dayEvents = events.filter((e) => isSameDay(e.start, day))

//             return (
//               <div
//                 key={dayIdx}
//                 className="flex-1 relative border-r border-slate-100 last:border-r-0 hover:bg-slate-50/50 cursor-pointer"
//                 onClick={(e) => {
//                   // Basic click-to-add logic based on Y position (approximate)
//                   const rect = e.currentTarget.getBoundingClientRect()
//                   const y = e.clientY - rect.top
//                   const percentY = y / rect.height
//                   const totalMinutes = (END_HOUR - START_HOUR + 1) * 60
//                   const clickedMinutes = percentY * totalMinutes

//                   const hour = START_HOUR + Math.floor(clickedMinutes / 60)
//                   const minute = Math.floor((clickedMinutes % 60) / 30) * 30 // Snap to 30 min

//                   const start = setMinutes(setHours(day, hour), minute)
//                   onSelectSlot({ start })
//                 }}
//               >
//                 {/* Events for this day */}
//                 {dayEvents.map((event) => {
//                   const styles = getEventStyles(event)
//                   const colors =
//                     SUBJECT_COLORS[event.subject] ||
//                     SUBJECT_COLORS['Mathematics']

//                   return (
//                     <div
//                       key={event.id}
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         onSelectEvent(event)
//                       }}
//                       className={`absolute left-1 right-1 p-2 rounded-md border-l-4 ${colors.border} ${colors.eventBg} ${colors.text} shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:brightness-95 cursor-pointer z-10 group`}
//                       style={{
//                         top: styles.top,
//                         height: styles.height,
//                         minHeight: '40px',
//                       }}
//                     >
//                       <div className="flex justify-between items-start">
//                         <span className="text-xs font-bold leading-tight truncate group-hover:whitespace-normal group-hover:z-20 bg-inherit">
//                           {event.title}
//                         </span>
//                       </div>
//                       <span className="text-[10px] font-medium opacity-80 mt-auto truncate">
//                         {format(event.start, 'h:mm a')} - {event.classGroup}
//                       </span>
//                     </div>
//                   )
//                 })}
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }

// const MonthView = ({ currentDate, events, onSelectEvent, onSelectSlot }) => {
//   const monthStart = startOfMonth(currentDate)
//   const monthEnd = endOfMonth(monthStart)
//   const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
//   const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

//   const dateFormat = 'd'
//   const rows = []

//   let days = []
//   let day = startDate
//   let formattedDate = ''

//   while (day <= endDate) {
//     for (let i = 0; i < 7; i++) {
//       formattedDate = format(day, dateFormat)
//       const cloneDay = day

//       const dayEvents = events.filter((e) => isSameDay(e.start, cloneDay))

//       days.push(
//         <div
//           className={`min-h-[100px] bg-white border border-slate-100 p-2 cursor-pointer transition-colors hover:bg-slate-50 ${
//             !isSameMonth(day, monthStart)
//               ? 'text-slate-300 bg-slate-50/50'
//               : isSameDay(day, today)
//               ? 'text-blue-600 bg-blue-50/20 font-bold'
//               : 'text-slate-700'
//           }`}
//           key={day}
//           onClick={() => onSelectSlot({ start: cloneDay })}
//         >
//           <div className="flex justify-between items-center mb-1">
//             <span className="text-sm w-6 h-6 flex items-center justify-center rounded-full">
//               {formattedDate}
//             </span>
//           </div>
//           <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
//             {dayEvents.map((evt, idx) => {
//               const colors =
//                 SUBJECT_COLORS[evt.subject] || SUBJECT_COLORS['Mathematics']
//               return (
//                 <div
//                   key={idx}
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     onSelectEvent(evt)
//                   }}
//                   className={`text-xs px-1.5 py-0.5 rounded truncate font-medium ${colors.bg} ${colors.text} border-l-2 ${colors.border} hover:opacity-80`}
//                   title={evt.title}
//                 >
//                   {format(evt.start, 'h:mma').toLowerCase()} {evt.title}
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )
//       day = addDays(day, 1)
//     }
//     rows.push(
//       <div className="grid grid-cols-7" key={day}>
//         {days}
//       </div>
//     )
//     days = []
//   }

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//       <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
//         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
//           <div
//             key={d}
//             className="p-3 text-center text-xs font-semibold text-slate-500 uppercase border-r border-slate-100 last:border-r-0"
//           >
//             {d}
//           </div>
//         ))}
//       </div>
//       <div className="flex-1 overflow-y-auto">{rows}</div>
//     </div>
//   )
// }

// export default function App() {
//   const [events, setEvents] = useState(initialEvents)
//   const [view, setView] = useState(VIEWS.WEEK)
//   const [currentDate, setCurrentDate] = useState(new Date())
//   const [selectedEvent, setSelectedEvent] = useState(null)
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false)
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true)

//   const handleSelectEvent = useCallback((event) => {
//     setSelectedEvent(event)
//     setIsDrawerOpen(true)
//   }, [])

//   const handleSelectSlot = useCallback(({ start }) => {
//     const title = window.prompt('Quick Add: Enter Lesson Title:')
//     if (title) {
//       setEvents((prev) => [
//         ...prev,
//         {
//           id: Math.random(),
//           title,
//           start,
//           end: addDays(start, 1 / 24), // Add 1 hour default
//           subject: 'Mathematics', // Default
//           classGroup: 'TBD',
//           teacher: 'Current User',
//           status: 'Draft',
//           summary: 'New lesson plan draft.',
//           content: '<p>Start planning here...</p>',
//           hasAttachment: false,
//         },
//       ])
//     }
//   }, [])

//   const nextDate = () => {
//     if (view === VIEWS.MONTH) setCurrentDate(addMonths(currentDate, 1))
//     else if (view === VIEWS.WEEK) setCurrentDate(addDays(currentDate, 7))
//     else setCurrentDate(addDays(currentDate, 1))
//   }

//   const prevDate = () => {
//     if (view === VIEWS.MONTH) setCurrentDate(subMonths(currentDate, 1))
//     else if (view === VIEWS.WEEK) setCurrentDate(subDays(currentDate, 7))
//     else setCurrentDate(subDays(currentDate, 1))
//   }

//   const goToToday = () => setCurrentDate(new Date())

//   const getHeaderLabel = () => {
//     if (view === VIEWS.MONTH) return format(currentDate, 'MMMM yyyy')
//     if (view === VIEWS.WEEK) {
//       const start = startOfWeek(currentDate, { weekStartsOn: 1 })
//       const end = addDays(start, 4) // Show Mon-Fri range
//       if (isSameMonth(start, end))
//         return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
//       return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
//     }
//     return format(currentDate, 'EEEE, MMM d, yyyy')
//   }

//   return (
//     <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
//       {/* Sidebar - Collapsible on Desktop, Hidden on Mobile */}
//       <aside
//         className={`${
//           isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
//         } transition-all duration-300 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 absolute lg:relative h-full`}
//       >
//         <div className="p-4 border-b border-slate-200 flex items-center justify-between">
//           <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
//             <LayoutGrid size={24} />
//             <span className="truncate">EduPlan ERP</span>
//           </div>
//           <button
//             className="lg:hidden text-slate-500 hover:bg-slate-100 p-1 rounded"
//             onClick={() => setIsSidebarOpen(false)}
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-6">
//           <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm shadow-blue-200 transition flex items-center justify-center gap-2">
//             <Plus size={18} /> New Lesson
//           </button>

//           <div>
//             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
//               Subjects
//             </h4>
//             <div className="space-y-2">
//               {Object.entries(SUBJECT_COLORS).map(([subject, colors]) => (
//                 <div
//                   key={subject}
//                   className="flex items-center gap-3 text-sm text-slate-700"
//                 >
//                   <div className={`w-3 h-3 rounded-sm ${colors.solid}`}></div>
//                   {subject}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
//               Drafts{' '}
//               <span className="bg-slate-100 text-slate-600 px-1.5 rounded-md">
//                 2
//               </span>
//             </h4>
//             <div className="space-y-2">
//               <div className="p-2.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition">
//                 <p className="text-sm font-medium text-slate-800 truncate">
//                   Photosynthesis Lab
//                 </p>
//                 <p className="text-xs text-slate-500">Science • Grade 9-B</p>
//               </div>
//               <div className="p-2.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition">
//                 <p className="text-sm font-medium text-slate-800 truncate">
//                   Poetry Analysis
//                 </p>
//                 <p className="text-xs text-slate-500">English • Grade 11-A</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 flex flex-col min-w-0 h-full relative">
//         {/* Top Header/Nav */}
//         <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
//           <div className="flex items-center gap-3">
//             <button
//               className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
//               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//             >
//               <Menu size={20} />
//             </button>
//             <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
//               Lesson Plan Calendar
//             </h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
//               <Filter size={18} />
//             </button>
//             <div className="w-px h-6 bg-slate-200 mx-1"></div>
//             <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition">
//               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
//                 BS
//               </div>
//               <div className="hidden sm:block">
//                 <p className="text-sm font-semibold text-slate-700 leading-tight">
//                   Binay Shrestha
//                 </p>
//                 <p className="text-xs text-slate-500">Senior Teacher</p>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Custom Toolbar Area */}
//         <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-4 lg:px-6 bg-white border-b border-slate-200 shrink-0">
//           <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto justify-between sm:justify-start">
//             <div className="flex items-center bg-slate-100 rounded-lg p-1">
//               <button
//                 onClick={prevDate}
//                 className="p-1.5 rounded hover:bg-white text-slate-600 hover:shadow-sm transition"
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <button
//                 onClick={goToToday}
//                 className="px-3 py-1.5 text-sm font-medium rounded hover:bg-white text-slate-700 hover:shadow-sm transition"
//               >
//                 Today
//               </button>
//               <button
//                 onClick={nextDate}
//                 className="p-1.5 rounded hover:bg-white text-slate-600 hover:shadow-sm transition"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//             <h2 className="text-lg sm:text-xl font-bold text-slate-800 min-w-[180px] text-center sm:text-left">
//               {getHeaderLabel()}
//             </h2>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
//             <div className="relative w-full sm:w-64">
//               <Search
//                 size={16}
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
//               />
//               <input
//                 type="text"
//                 placeholder="Search lessons..."
//                 className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 transition"
//               />
//             </div>

//             <div className="flex bg-slate-100 rounded-lg p-1 w-full sm:w-auto justify-center">
//               {[VIEWS.MONTH, VIEWS.WEEK].map((v) => (
//                 <button
//                   key={v}
//                   onClick={() => setView(v)}
//                   className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
//                     view === v
//                       ? 'bg-white text-blue-600 shadow-sm'
//                       : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
//                   }`}
//                 >
//                   {v}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Calendar Wrapper */}
//         <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col bg-slate-50">
//           <div className="flex-1 relative">
//             {view === VIEWS.WEEK && (
//               <WeekView
//                 currentDate={currentDate}
//                 events={events}
//                 onSelectEvent={handleSelectEvent}
//                 onSelectSlot={handleSelectSlot}
//               />
//             )}
//             {view === VIEWS.MONTH && (
//               <MonthView
//                 currentDate={currentDate}
//                 events={events}
//                 onSelectEvent={handleSelectEvent}
//                 onSelectSlot={handleSelectSlot}
//               />
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Slide-out Event Detail Drawer */}
//       <EventDrawer
//         event={selectedEvent}
//         isOpen={isDrawerOpen}
//         onClose={() => setIsDrawerOpen(false)}
//       />
//     </div>
//   )
// }
