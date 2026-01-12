import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/public/Navbar";
import { FaMapMarkerAlt, FaRegClock, FaStar, FaFutbol } from "react-icons/fa";
import { getVenueById } from "../../services/user/venue.service"; 
import { getFieldSchedules } from "../../services/user/field.service";
import userBookingService from "../../services/user/booking.service";

const DetailVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking flow
  const [selectedField, setSelectedField] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Fetch venue detail
  useEffect(() => {
    getVenueById(id)
      .then((data) => {
        setVenue(data);
        if (data.fields && data.fields.length > 0) setSelectedField(data.fields[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch schedules when field/date changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedField) return;
      try {
        const schedules = await getFieldSchedules(selectedField.id, selectedDate);
        setAvailableSchedules(schedules);
        setSelectedSlots([]); // reset selection
      } catch (err) {
        console.error("Error fetching schedules:", err);
        setAvailableSchedules([]);
      }
    };
    fetchSchedules();
  }, [selectedField, selectedDate]);

  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot.id)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot.id]);
    }
  };

  // ==================================================
  // HANDLE CONFIRM BOOKING
  // ==================================================
  const handleConfirmBooking = async () => {
    if (!selectedField || selectedSlots.length === 0) return;

    try {
      const payload = {
        schedule_ids: selectedSlots, // array dari slot id
      };

      const res = await userBookingService.createBooking(payload);
      console.log("Booking berhasil:", res);

      // Redirect ke halaman detail booking atau sukses
      navigate(`/user/booking/${res.data.id}`);
    } catch (err) {
      console.error("Booking gagal:", err);
      alert(err.response?.data?.message || "Booking gagal, coba lagi.");
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-cyan-500 font-black italic tracking-widest">LOADING ARENA...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500">
      <Navbar />
      
      {/* HERO SECTION */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={venue?.image ? `http://localhost:8000/storage/${venue.image}` : "/images/basketball-court-night.jpg"} 
          className="w-full h-full object-cover opacity-50"
          alt={venue?.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/20" />
        <div className="absolute bottom-20 left-12 md:left-24">
          <motion.span initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} className="text-cyan-500 font-bold tracking-[0.5em] uppercase text-sm mb-4 block">Venue Detail</motion.span>
          <motion.h1 initial={{y:30, opacity:0}} animate={{y:0, opacity:1}} className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
            {venue?.name}
          </motion.h1>
          <div className="flex items-center gap-6 mt-6 text-gray-400 font-bold uppercase tracking-widest text-xs">
            <span className="flex items-center gap-2 border-r border-white/10 pr-6"><FaMapMarkerAlt className="text-cyan-500" /> {venue?.address}</span>
            <span className="flex items-center gap-2"><FaStar className="text-yellow-500" /> 5.0 Rating</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-24 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        <div className="lg:col-span-2">
          {/* STEP 1: PILIH LAPANGAN */}
          <section className="mb-16">
            <h3 className="text-3xl font-black italic uppercase mb-8 flex items-center gap-4">
              <span className="w-10 h-10 bg-cyan-500 text-black flex items-center justify-center rounded-lg not-italic">01</span>
              Pilih Lapangan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venue?.fields?.map((field) => (
                <button
                  key={field.id}
                  onClick={() => { setSelectedField(field); setSelectedSlots([]); }}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center gap-4
                    ${selectedField?.id === field.id ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]" : "border-white/5 bg-[#111] hover:border-white/20"}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedField?.id === field.id ? "bg-cyan-500 text-black" : "bg-gray-800 text-gray-400"}`}>
                    <FaFutbol size={20} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic tracking-wider">{field.name}</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase">Rp {parseInt(field.price_per_hour).toLocaleString()} / Jam</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* STEP 2: PILIH JADWAL */}
          <section className="mb-12">
            <h3 className="text-3xl font-black italic uppercase mb-8 flex items-center gap-4">
              <span className="w-10 h-10 bg-cyan-500 text-black flex items-center justify-center rounded-lg not-italic">02</span>
              Jadwal Tersedia
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-cyan-500 tracking-widest block mb-3 ml-2">Select Play Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlots([]); }}
                  className="w-full bg-[#111] border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {availableSchedules.map((slot) => {
                const isSelected = selectedSlots.includes(slot.id);
                let bgClass = "bg-[#111] border-white/5 text-gray-400 hover:border-cyan-500/50";
                if (isSelected) bgClass = "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-95";
                else if (slot.status === "booked") bgClass = "bg-red-800 border-red-600 text-gray-300 cursor-not-allowed";
                else if (slot.status === "locked") bgClass = "bg-yellow-800 border-yellow-600 text-gray-300 cursor-not-allowed";
                else if (slot.status === "maintenance") bgClass = "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed";

                return (
                  <button
                    key={slot.id}
                    onClick={() => slot.status === "available" && toggleSlot(slot)}
                    className={`p-5 rounded-2xl font-black transition-all border-2 flex flex-col items-center gap-2 ${bgClass}`}
                  >
                    <FaRegClock size={18} />
                    <span className="text-sm">{slot.start_time} - {slot.end_time}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* SUMMARY PANEL */}
        <div className="lg:col-span-1">
          <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-10 sticky top-32 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
            
            <h4 className="text-2xl font-black italic uppercase mb-8 text-white border-b border-white/5 pb-4">Order Summary</h4>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Field</span>
                <span className="font-bold uppercase italic text-sm">{selectedField?.name || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Date</span>
                <span className="font-bold text-sm">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Session</span>
                <span className="font-bold text-sm text-cyan-500">{selectedSlots.length} Hours</span>
              </div>
            </div>
            
            <div className="bg-black/40 p-6 rounded-3xl mb-10">
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] block mb-2">Total Amount</span>
              <span className="text-4xl font-black text-white italic">
                Rp {(selectedSlots.length * (selectedField?.price_per_hour || 0)).toLocaleString()}
              </span>
            </div>

            <button 
              disabled={selectedSlots.length === 0}
              onClick={handleConfirmBooking}  // <- pakai function handleConfirmBooking
              className="w-full py-6 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all disabled:bg-gray-800 disabled:text-gray-600 shadow-[0_10px_30px_rgba(6,182,212,0.3)] text-xs italic"
            >
              Confirm Booking
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailVenue;
