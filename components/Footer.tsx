import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="font-semibold text-white mb-3">WhatMobile</div>
          <p className="text-xs leading-relaxed">
            Pakistan&apos;s leading mobile phone price comparison website.
            Updated daily with latest prices from the market.
          </p>
        </div>

        <div>
          <div className="font-medium text-white mb-3">Explore</div>
          <ul className="space-y-1.5 text-xs">
            <li><Link href="/prices/under-20000" className="hover:text-white">Phones Under 20,000</Link></li>
            <li><Link href="/prices/20000-40000" className="hover:text-white">Phones 20K - 40K</Link></li>
            <li><Link href="/prices/40000-80000" className="hover:text-white">Mid Range Phones</Link></li>
            <li><Link href="/search" className="hover:text-white">All Phones</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-white mb-3">Popular Brands</div>
          <ul className="space-y-1.5 text-xs">
            <li><Link href="/brands/samsung" className="hover:text-white">Samsung</Link></li>
            <li><Link href="/brands/apple" className="hover:text-white">Apple iPhone</Link></li>
            <li><Link href="/brands/xiaomi" className="hover:text-white">Xiaomi</Link></li>
            <li><Link href="/brands/infinix" className="hover:text-white">Infinix</Link></li>
            <li><Link href="/brands/realme" className="hover:text-white">Realme</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium text-white mb-3">Company</div>
          <ul className="space-y-1.5 text-xs">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">How we get prices</a></li>
            <li><a href="#" className="hover:text-white">Advertise</a></li>
          </ul>
          <div className="mt-4 text-[10px] text-gray-500">
            Prices shown are indicative and may vary by retailer.
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs">
        © {currentYear} WhatMobile.pk Clone. Built for educational purposes.
      </div>
    </footer>
  );
}
