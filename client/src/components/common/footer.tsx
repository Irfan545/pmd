// app/components/Footer.tsx
'use client';

import { ChevronDown, Mail, Send, CreditCard, Truck, Banknote } from "lucide-react";
import { useState } from "react";

const Section = ({ title, items }: { title: string; items: string[] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="w-full flex justify-between items-center py-3 md:py-0 md:block md:cursor-default"
        onClick={() => setOpen(!open)}
      >
        <h3 className="font-semibold text-left">{title}</h3>
        <ChevronDown className={`md:hidden transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <ul
        className={`text-sm space-y-2 mt-2 ${
          open ? 'block' : 'hidden'
        } md:block`}
      >
        {items.map((item) => (
          <li key={item}>
            <a href="/" className="text-foreground hover:underline">{item}
                </a>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default function Footer() {
  return (
    <footer className="bg-background text-gray-700 px-6 py-10 mt-10 border-t text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <Section
          title="ABOUT AIMOTORSPARE"
          items={[
            "About us",
            "Company Information",
            "Bonus programme",
            "Press",
            "AIMOTORSPARE app",
            "RIDEX",
          ]}
        />
        <Section
          title="HELP & SUPPORT"
          items={[
            "AIMOTORSPARE Club",
            "Blog",
            "Repair manuals & tutorials",
            "Terms & conditions",
            "Right of withdrawal",
            "Privacy policy",
            "Cookie settings",
            "Code of Conduct",
          ]}
        />
        <Section
          title="CUSTOMER SERVICE"
          items={[
            "Help Centre",
            "Payment",
            "Delivery",
            "Contact us",
            "Returns & refunds",
            "Core exchange",
          ]}
        />
        <Section
          title="TOP PRODUCTS"
          items={[
            "Lighting",
            "Shock absorber",
            "Clutch kit",
            "Suspension arm",
            "Wheel bearing",
            "Car care products",
            "Shop by maker",
            "Shop by model",
            "Shop by brand",
            "Parts brands",
          ]}
        />
      </div>

      {/* Newsletter */}
      <div className="mt-10 border-t pt-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-semibold mb-2 text-lg">
            Subscribe now and get £2 off your next purchase!
          </p>
          <p className="text-sm mb-4">
            Yes, I would like to receive the personalised AIMOTORSPARE newsletter with information on products, discounts, special offers, and more.
          </p>
          <form className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <input
              type="email"
              placeholder="Email*"
              className="px-4 py-2 w-full sm:w-1/2 border rounded-lg"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Send size={16} /> Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Payment & Legal */}
      <div className="mt-10 border-t pt-6 text-gray-500 space-y-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={16} /> Visa
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={16} /> Mastercard
          </div>
          {/* <div className="flex items-center gap-2">
            <Paypal size={16} /> PayPal
          </div> */}
          <div className="flex items-center gap-2">
            <Banknote size={16} /> Bank Transfer
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={16} /> AmEx
          </div>
          <div className="flex items-center gap-2">
            <Truck size={16} /> EVRI
          </div>
        </div>

        
        <p className="text-center text-xs">
          Customer service hours (UK): Mon–Sat 9:00–18:00 Sun: Closed<br />
            AIMOTORSPARE UK Parts – United Kingdom<br />
          &copy; 2025 www.aimotorspare.co.uk – AIMOTORSPARE Online Shop<br />
          Owner: AIMOTORSPARE,
        </p>
      </div>
    </footer>
  );
}
