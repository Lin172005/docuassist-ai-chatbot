"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

function ContactForm() {
  const searchParams = useSearchParams();
  const productName = searchParams.get("name");
  const qty = searchParams.get("qty");
  const variant = searchParams.get("variant");
  const subjParam = searchParams.get("subject");

  const defaultSubject = subjParam
    ? subjParam
    : productName
    ? `Order Enquiry: ${qty || "1"}x ${productName}${variant ? ` (${variant})` : ""}`
    : "";

  const defaultMessage = productName
    ? `Hello WildHive,\n\nI would like to enquire about ordering ${qty || "1"} unit(s) of ${productName}${variant ? ` (${variant})` : ""}. Please let me know the availability, delivery schedule, and payment details.`
    : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    // Simulate server dispatch
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-card p-8 sm:p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf1ec] text-[#1e3d2f] text-2xl font-bold">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold text-[#1c2e24]">Message Received</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#637368] max-w-md mx-auto">
          Thank you, <strong>{name}</strong>! Your message regarding &ldquo;{subject}&rdquo; has been sent to the WildHive team. We will respond to <strong>{email}</strong> within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
          }}
          className="mt-6 btn-secondary text-xs"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="min-card p-8 sm:p-10">
      <h2 className="text-xl font-bold text-[#1c2e24]">Send us a message</h2>
      <p className="mt-1 text-xs text-[#637368]">
        Order enquiries, wholesale requests, or question about our hives.
      </p>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {errorMsg}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-[#1c2e24]">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anand Sharma"
              className="min-input"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-[#1c2e24]">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-xs font-semibold text-[#1c2e24]">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="How can we assist you?"
            className="min-input"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-xs font-semibold text-[#1c2e24]">
            Message *
          </label>
          <textarea
            id="message"
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message or order specifications here..."
            className="min-input resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary !py-3 font-semibold text-sm disabled:opacity-60"
        >
          {isSubmitting ? "Sending message..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#faf9f5] text-[#1c2e24]">
      <Header />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-4">
        <nav className="flex items-center gap-2 text-xs text-[#8a9890]">
          <Link href="/" className="hover:text-[#1c2e24] transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-[#1c2e24]">Contact &amp; Enquiries</span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left info */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c98a2c]">
              Get in Touch
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1c2e24] sm:text-4xl">
              We&apos;d love to hear from you.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#637368] max-w-md">
              Whether you have a question about our honey varieties, need help with an order, or want bulk harvest supplies, our team is ready to help.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f2eb] text-sm text-[#1e3d2f]">
                  ✉
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1c2e24]">Email</h3>
                  <a
                    href="mailto:hello@wildhive.com"
                    className="text-xs text-[#637368] hover:text-[#c98a2c] transition"
                  >
                    hello@wildhive.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f2eb] text-sm text-[#1e3d2f]">
                  ✆
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1c2e24]">Phone &amp; WhatsApp</h3>
                  <a
                    href="tel:+919876543210"
                    className="text-xs text-[#637368] hover:text-[#c98a2c] transition"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f2eb] text-sm text-[#1e3d2f]">
                  ⚲
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1c2e24]">Location</h3>
                  <p className="text-xs text-[#637368]">
                    Natural Harvest Region, Western Ghats &amp; Nilgiris, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right form with Suspense for useSearchParams */}
          <Suspense fallback={<div className="min-card p-10 text-center text-sm text-[#637368]">Loading form...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
