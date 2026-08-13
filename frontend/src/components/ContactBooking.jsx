import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Phone, Clock, ArrowRight, Loader2 } from "lucide-react";
import { submitBooking, submitEnquiry } from "@/lib/api";
import TrackedHeading from "@/components/TrackedHeading";

const serviceTypes = [
  "Repairs & Diagnostics",
  "Servicing & Maintenance",
  "MOT & Inspection",
  "Tyres & Fitting",
  "Custom Build / Restoration",
];

const emptyBooking = { name: "", phone: "", email: "", bike_model: "", service_type: "", preferred_date: "", notes: "", budget_range: "", project_vision: "" };
const emptyEnquiry = { name: "", email: "", message: "" };

const ContactBooking = () => {
  const [tab, setTab] = useState("booking");
  const [booking, setBooking] = useState(emptyBooking);
  const [enquiry, setEnquiry] = useState(emptyEnquiry);
  const [sending, setSending] = useState(false);

  const sendBooking = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = { ...booking, email: booking.email || null, preferred_date: booking.preferred_date || null, notes: booking.notes || null, budget_range: booking.budget_range || null, project_vision: booking.project_vision || null };
      await submitBooking(payload);
      toast.success("Booking request received. We'll ring you back within one working day.");
      setBooking(emptyBooking);
    } catch {
      toast.error("Couldn't send that — please call us instead.");
    } finally {
      setSending(false);
    }
  };

  const sendEnquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitEnquiry(enquiry);
      toast.success("Message sent. We'll get back to you shortly.");
      setEnquiry(emptyEnquiry);
    } catch {
      toast.error("Couldn't send that — please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-28 lg:py-40" data-testid="contact-section">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <p className="mono-label text-[#D35400] mb-5" data-testid="contact-kicker">Get booked in</p>
          <TrackedHeading className="text-5xl md:text-7xl mb-8" data-testid="contact-heading">
            Roll in.<br />
            <span className="text-stroke">Roll out.</span>
          </TrackedHeading>
          <p className="text-[#A1A1AA] text-base leading-relaxed max-w-md mb-14">
            Tell us what's wrong — or what you're dreaming of — and we'll call you
            back with a time and a straight quote.
          </p>

          <div className="flex flex-col gap-8" data-testid="contact-details">
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-[#D35400] mt-1 shrink-0" />
              <div>
                <p className="mono-label text-[#52525B] mb-2">The workshop</p>
                <p className="text-[#F5F5F5] text-sm leading-relaxed" data-testid="contact-address">
                  Unit 4, Foundry Lane<br />Millbrook, MB1 2QT
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone size={20} className="text-[#D35400] mt-1 shrink-0" />
              <div>
                <p className="mono-label text-[#52525B] mb-2">Call the bench</p>
                <a href="tel:+441234567890" data-testid="contact-phone" className="text-[#F5F5F5] text-sm hover:text-[#E67E22] transition-colors duration-300">
                  01234 567 890
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock size={20} className="text-[#D35400] mt-1 shrink-0" />
              <div>
                <p className="mono-label text-[#52525B] mb-2">Hours</p>
                <p className="text-[#F5F5F5] text-sm leading-relaxed" data-testid="contact-hours">
                  Mon–Fri: 8:30 — 17:30<br />Sat: 9:00 — 13:00<br />Sun: Closed
                </p>
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
              Book a service
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
              General enquiry
            </button>
          </div>

          {tab === "booking" ? (
            <form onSubmit={sendBooking} className="flex flex-col gap-6" data-testid="booking-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bk-name" className="mono-label text-[#52525B] block mb-3">Your name *</label>
                  <input id="bk-name" data-testid="booking-name-input" required className="input-industrial" placeholder="Alex Rider"
                    value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="bk-phone" className="mono-label text-[#52525B] block mb-3">Phone *</label>
                  <input id="bk-phone" data-testid="booking-phone-input" required type="tel" className="input-industrial" placeholder="07700 900 123"
                    value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bk-email" className="mono-label text-[#52525B] block mb-3">Email</label>
                  <input id="bk-email" data-testid="booking-email-input" type="email" className="input-industrial" placeholder="you@email.com"
                    value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="bk-bike" className="mono-label text-[#52525B] block mb-3">Bike make & model *</label>
                  <input id="bk-bike" data-testid="booking-bike-input" required className="input-industrial" placeholder="e.g. Triumph Bonneville T120"
                    value={booking.bike_model} onChange={(e) => setBooking({ ...booking, bike_model: e.target.value })} />
                </div>
              </div>
              <div>
                <span className="mono-label text-[#52525B] block mb-3">Service needed *</span>
                <div className="flex flex-wrap gap-2" data-testid="booking-service-chips">
                  {serviceTypes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-testid={`chip-${s.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                      onClick={() => setBooking({ ...booking, service_type: s })}
                      className={`mono-label px-4 py-2.5 border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400] ${
                        booking.service_type === s
                          ? "border-[#D35400] text-[#E67E22] bg-[#D35400]/10"
                          : "border-white/20 text-[#A1A1AA] hover:border-white/40 hover:text-[#F5F5F5]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input type="text" className="hidden" required value={booking.service_type} readOnly data-testid="booking-service-required" />
              </div>

              {booking.service_type === "Custom Build / Restoration" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="border border-[#D35400]/40 bg-[#D35400]/5 p-6 overflow-hidden"
                  data-testid="custom-quote-panel"
                >
                  <p className="font-display uppercase text-2xl text-[#F5F5F5] mb-2">Custom quote — tell us the dream</p>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                    Every build starts with a brew and a chat in the workshop. Give us a
                    rough budget and the idea in your head — we'll come back with a plan,
                    a timeline and a straight price.
                  </p>
                  <span className="mono-label text-[#52525B] block mb-3">Rough budget</span>
                  <div className="flex flex-wrap gap-2 mb-6" data-testid="budget-chips">
                    {["Under £2k", "£2k – £5k", "£5k – £10k", "£10k+"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        data-testid={`budget-chip-${b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                        onClick={() => setBooking({ ...booking, budget_range: b })}
                        className={`mono-label px-4 py-2.5 border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400] ${
                          booking.budget_range === b
                            ? "border-[#D35400] text-[#E67E22] bg-[#D35400]/10"
                            : "border-white/20 text-[#A1A1AA] hover:border-white/40 hover:text-[#F5F5F5]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <label htmlFor="bk-vision" className="mono-label text-[#52525B] block mb-3">Project vision</label>
                  <textarea
                    id="bk-vision"
                    data-testid="booking-vision-input"
                    rows={3}
                    className="input-industrial resize-none"
                    placeholder="Café racer stance, clip-ons, blacked-out engine, brass details…"
                    value={booking.project_vision}
                    onChange={(e) => setBooking({ ...booking, project_vision: e.target.value })}
                  />
                </motion.div>
              )}
              <div>
                <label htmlFor="bk-date" className="mono-label text-[#52525B] block mb-3">Preferred date / time</label>
                <input id="bk-date" data-testid="booking-date-input" className="input-industrial" placeholder="e.g. Any weekday morning next week"
                  value={booking.preferred_date} onChange={(e) => setBooking({ ...booking, preferred_date: e.target.value })} />
              </div>
              <div>
                <label htmlFor="bk-notes" className="mono-label text-[#52525B] block mb-3">Anything else?</label>
                <textarea id="bk-notes" data-testid="booking-notes-input" rows={3} className="input-industrial resize-none" placeholder="Rattling at 4k rpm, brakes feel soft…"
                  value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} />
              </div>
              <button type="submit" data-testid="booking-submit-button" disabled={sending} className="btn-accent w-fit disabled:opacity-60 group">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />}
                {sending ? "Sending…" : "Request booking"}
              </button>
            </form>
          ) : (
            <form onSubmit={sendEnquiry} className="flex flex-col gap-6" data-testid="enquiry-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="en-name" className="mono-label text-[#52525B] block mb-3">Your name *</label>
                  <input id="en-name" data-testid="enquiry-name-input" required className="input-industrial" placeholder="Alex Rider"
                    value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="en-email" className="mono-label text-[#52525B] block mb-3">Email *</label>
                  <input id="en-email" data-testid="enquiry-email-input" required type="email" className="input-industrial" placeholder="you@email.com"
                    value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label htmlFor="en-msg" className="mono-label text-[#52525B] block mb-3">Message *</label>
                <textarea id="en-msg" data-testid="enquiry-message-input" required rows={6} className="input-industrial resize-none" placeholder="Ask us anything — quotes, parts, project ideas…"
                  value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} />
              </div>
              <button type="submit" data-testid="enquiry-submit-button" disabled={sending} className="btn-accent w-fit disabled:opacity-60 group">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />}
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactBooking;
