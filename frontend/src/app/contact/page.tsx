"use client";

import Header from "@/components/Header";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#243b2a]">
      <Header />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-24">
        <nav className="flex items-center gap-2 text-sm text-[#879088]">
          <a href="/" className="transition hover:text-[#d88a16]">
            Home
          </a>
          <span>/</span>
          <span className="font-medium text-[#243b2a]">Contact</span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left — Info */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d88a16]">
              Get in Touch
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#243b2a] sm:text-5xl">
              We&apos;d love to hear
              <span className="text-[#d88a16]"> from you.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#657168]">
              Whether you have a question about our honey, need help with an
              order, or want to partner with us — our team is ready to help.
            </p>

            <div className="mt-12 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff0c8]">
                  <svg
                    className="h-6 w-6 text-[#d88a16]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#243b2a]">Email</h3>
                  <a
                    href="mailto:hello@wildhive.com"
                    className="mt-1 text-[#657168] transition hover:text-[#d88a16]"
                  >
                    hello@wildhive.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff0c8]">
                  <svg
                    className="h-6 w-6 text-[#d88a16]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#243b2a]">Phone</h3>
                  <a
                    href="tel:+919876543210"
                    className="mt-1 text-[#657168] transition hover:text-[#d88a16]"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff0c8]">
                  <svg
                    className="h-6 w-6 text-[#d88a16]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#243b2a]">Location</h3>
                  <p className="mt-1 text-[#657168]">
                    Natural Harvest Region, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="rounded-3xl border border-[#eee7d8] bg-white p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold text-[#243b2a]">
              Send us a message
            </h2>
            <p className="mt-2 text-[#657168]">
              Fill out the form and we&apos;ll get back to you within 24 hours.
            </p>

            <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[#243b2a]"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-[#d8d0c1] px-4 py-3 text-[#243b2a] outline-none transition placeholder:text-[#929a93] focus:border-[#d88a16]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#243b2a]"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#d8d0c1] px-4 py-3 text-[#243b2a] outline-none transition placeholder:text-[#929a93] focus:border-[#d88a16]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-[#243b2a]"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-[#d8d0c1] px-4 py-3 text-[#243b2a] outline-none transition placeholder:text-[#929a93] focus:border-[#d88a16]"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-[#243b2a]"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full resize-none rounded-xl border border-[#d8d0c1] px-4 py-3 text-[#243b2a] outline-none transition placeholder:text-[#929a93] focus:border-[#d88a16]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#315c3a] px-5 py-3.5 font-semibold text-white transition hover:bg-[#264b2f]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
