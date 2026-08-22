import React from 'react';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { CONTACT } from '../../lib/constants';

interface BranchContactsProps {
  className?: string;
}

const toWhatsAppNumber = (phone: string) => {
  const localNumber = phone.replace(/\D/g, '').replace(/^0/, '');
  return `218${localNumber}`;
};

export const BranchContacts: React.FC<BranchContactsProps> = ({ className = '' }) => (
  <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-5 ${className}`}>
    {CONTACT.branches.map((branch) => (
      <section
        key={branch.name}
        aria-label={branch.name}
        className="group rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition-colors hover:border-sand-300/35 hover:bg-white/[0.065] sm:p-4"
      >
        <div className="flex min-h-11 items-center gap-2.5 border-b border-white/10 pb-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-sand-300/15 text-sand-200 ring-1 ring-inset ring-sand-200/15">
            <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-black leading-6 text-white">{branch.name}</h3>
        </div>

        <div className="mt-2.5 grid gap-1.5">
          {branch.phones.map((phone) => (
            <div key={phone.number} className="flex min-h-[46px] items-center gap-1.5">
              <a
                href={`tel:${phone.number}`}
                aria-label={`اتصال ${branch.name} على ${phone.number}`}
                className="flex min-h-[46px] min-w-0 flex-1 items-center justify-between gap-2 rounded-xl bg-white/[0.055] px-3 text-white/90 ring-1 ring-inset ring-white/[0.04] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-300"
              >
                <span dir="ltr" className="tabular-nums text-sm font-black tracking-wide">{phone.number}</span>
                <Phone className="h-4 w-4 flex-none text-emerald-400" aria-hidden="true" />
              </a>
              {phone.whatsapp && (
                <a
                  href={`https://wa.me/${toWhatsAppNumber(phone.number)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`واتساب ${branch.name} على ${phone.number}`}
                  title="واتساب"
                  className="inline-flex h-[46px] w-[46px] flex-none items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20 transition-colors hover:bg-emerald-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-300"
                >
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);
