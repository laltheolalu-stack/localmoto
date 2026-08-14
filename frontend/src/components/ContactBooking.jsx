import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Phone, ArrowRight, Loader2 } from "lucide-react";
import { submitBooking, submitEnquiry } from "@/lib/api";
import TrackedHeading from "@/components/TrackedHeading";
import { useLang } from "@/lib/site-lang";

const emptyBooking = { name: "", phone: "", email: "", bike_model: "", service_type: "", preferred_date: "", notes: "" };
const emptyEnquiry = { name: "", email: "", message: "" };

const ContactBooking = () => {
  const { t, lang } = useLang();
  const [tab, setTab] = useState("booking");
  const [booking, setBooking] = useState(emptyBooking);
  const [enquiry, setEnquiry] = useState(emptyEnquiry);
  const [sending, setSending] = useState(false);

  const sendBooking = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = { ...booking, email: booking.email || null, preferred_date: booking.preferred_date || null, notes: booking.notes || null, lang };
      await submitBooking(payload);
      toast.success(t.contact.toastBookingOk);
      setBooking(emptyBooking);
    } catch {
      toast.error(t.contact.toastBookingErr);
    } finally {
      setSending(false);
    }
  };

  const sendEnquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitEnquiry({ ...enquiry, lang });
      toast.success(t.contact.toastEnquiryOk);
      setEnquiry(emptyEnquiry);
    } catch {
      toast.error(t.contact.toastEnquiryErr);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-28 lg:py-40" data-testid="contact-section">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <p className="mono-label text-[#D35400] mb-5" data-testid="contact-kicker">{t.contact.kicker}</p>
          <TrackedHeading className="text-5xl md:text-7xl mb-8" data-testid="contact-heading">
            {t.contact.h1}<br />
            <span className="text-stroke">{t.contact.h2}</span>
          </TrackedHeading>
          <p className="text-[#A1A1AA] text-base leading-relaxed max-w-md mb-14">
            {t.contact.intro}
          </p>

          <div className="flex flex-col gap-8" data-testid="contact-details">
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-[#D35400] mt-1 shrink-0" />
              <div>
                <p className="mono-label text-[#52525B] mb-2">{t.contact.workshopLabel}</p>
                <p className="text-[#F5F5F5] text-sm leading-relaxed" data-testid="contact-address">
                  4273 Laurentian Autoroute
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone size={20} className="text-[#D35400] mt-1 shrink-0" />
              <div>
                <p className="mono-label text-[#52525B] mb-2">{t.contact.phoneLabel}</p>
                <a href="tel:+15142666607" data-testid="contact-phone" className="text-[#F5F5F5] text-sm hover:text-[#E67E22] transition-colors duration-300">
                  514 266 6607
                </a>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 bg-[#121212] border border-white/10 p-8 lg:p-12"
        >
          <div className="flex gap-px bg-white/10 border border-white/10 mb-10 w-fit" role="tablist">
            <button
              data-testid="tab-booking"
              role="tab"
              aria-selected={tab === "booking"}
              onClick={() => setTab("booking")}
              className={`mono-label px-6 py-3 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400] ${
                tab === "booking" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"
              }`}
            >
              {t.contact.tabBooking}
            </button>
            <button
              data-testid="tab-enquiry"
              role="tab"
              aria-selected={tab === "enquiry"}
              onClick={() => setTab("enquiry")}
              className={`mono-label px-6 py-3 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400] ${
                tab === "enquiry" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"
              }`}
            >
              {t.contact.tabEnquiry}
            </button>
          </div>

          {tab === "booking" ? (
            <form onSubmit={sendBooking} className="flex flex-col gap-6" data-testid="booking-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bk-name" className="mono-label text-[#52525B] block mb-3">{t.contact.name}</label>
                  <input id="bk-name" data-testid="booking-name-input" required className="input-industrial" placeholder={t.contact.namePh}
                    value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="bk-phone" className="mono-label text-[#52525B] block mb-3">{t.contact.phone}</label>
                  <input id="bk-phone" data-testid="booking-phone-input" required type="tel" className="input-industrial" placeholder={t.contact.phonePh}
                    value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bk-email" className="mono-label text-[#52525B] block mb-3">{t.contact.email}</label>
                  <input id="bk-email" data-testid="booking-email-input" type="email" className="input-industrial" placeholder={t.contact.emailPh}
                    value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="bk-bike" className="mono-label text-[#52525B] block mb-3">{t.contact.bike}</label>
                  <input id="bk-bike" data-testid="booking-bike-input" required className="input-industrial" placeholder={t.contact.bikePh}
                    value={booking.bike_model} onChange={(e) => setBooking({ ...booking, bike_model: e.target.value })} />
                </div>
              </div>
              <div>
                <span className="mono-label text-[#52525B] block mb-3">{t.contact.serviceNeeded}</span>
                <div className="flex flex-wrap gap-2" data-testid="booking-service-chips">
                  {t.contact.services.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      data-testid={`chip-${s.value.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                      onClick={() => setBooking({ ...booking, service_type: s.value })}
                      className={`mono-label px-4 py-2.5 border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400] ${
                        booking.service_type === s.value
                          ? "border-[#D35400] text-[#E67E22] bg-[#D35400]/10"
                          : "border-white/20 text-[#A1A1AA] hover:border-white/40 hover:text-[#F5F5F5]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <input type="text" className="hidden" required value={booking.service_type} readOnly data-testid="booking-service-required" />
              </div>
              <div>
                <label htmlFor="bk-date" className="mono-label text-[#52525B] block mb-3">{t.contact.dateLabel}</label>
                <input id="bk-date" data-testid="booking-date-input" className="input-industrial" placeholder={t.contact.datePh}
                  value={booking.preferred_date} onChange={(e) => setBooking({ ...booking, preferred_date: e.target.value })} />
              </div>
              <div>
                <label htmlFor="bk-notes" className="mono-label text-[#52525B] block mb-3">{t.contact.notes}</label>
                <textarea id="bk-notes" data-testid="booking-notes-input" rows={3} className="input-industrial resize-none" placeholder={t.contact.notesPh}
                  value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} />
              </div>
              <button type="submit" data-testid="booking-submit-button" disabled={sending} className="btn-accent w-fit disabled:opacity-60 group">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />}
                {sending ? t.contact.sending : t.contact.submitBooking}
              </button>
            </form>
          ) : (
            <form onSubmit={sendEnquiry} className="flex flex-col gap-6" data-testid="enquiry-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="en-name" className="mono-label text-[#52525B] block mb-3">{t.contact.name}</label>
                  <input id="en-name" data-testid="enquiry-name-input" required className="input-industrial" placeholder={t.contact.namePh}
                    value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="en-email" className="mono-label text-[#52525B] block mb-3">{t.contact.emailReq}</label>
                  <input id="en-email" data-testid="enquiry-email-input" required type="email" className="input-industrial" placeholder={t.contact.emailPh}
                    value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label htmlFor="en-msg" className="mono-label text-[#52525B] block mb-3">{t.contact.message}</label>
                <textarea id="en-msg" data-testid="enquiry-message-input" required rows={6} className="input-industrial resize-none" placeholder={t.contact.messagePh}
                  value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} />
              </div>
              <button type="submit" data-testid="enquiry-submit-button" disabled={sending} className="btn-accent w-fit disabled:opacity-60 group">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />}
                {sending ? t.contact.sending : t.contact.submitEnquiry}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactBooking;
