//homepage

import { useState } from 'react';
import { ShoppingCart, User, ChevronDown, Menu, X, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserService } from '../../userManagement/services/userService';
import logo from '../../../assets/logo.jpg';
import img1 from '../../../assets/1.jpg';
import img2 from '../../../assets/2.jpg';
import img3 from '../../../assets/3.jpg';
import img4 from '../../../assets/4.jpg';
import img5 from '../../../assets/5.jpg';
import img6 from '../../../assets/6.jpg';
import img7 from '../../../assets/7.jpg';
import img8 from '../../../assets/8.jpg';
import img9 from '../../../assets/9.jpg';
import acc from '../../../assets/acc.jpg';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  
  const handleLogout = () => {
    UserService.logout();
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl md:text-2xl">Nelson Enterprises</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-blue-300 transition duration-300">Home</Link>
              
              {/* Products Dropdown */}
              <div className="relative group">
                <button
                  className="flex items-center hover:text-blue-300 transition duration-300"
                  onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                >
                  Products <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {isProductsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 text-gray-800">
                    <Link to="/products/gases" className="block px-4 py-2 hover:bg-blue-100">Gases</Link>
                    <Link to="/products/accessories" className="block px-4 py-2 hover:bg-blue-100">Accessories</Link>
                  </div>
                )}
              </div>
              
              <Link to="/about" className="hover:text-blue-300 transition duration-300">About Us</Link>
              <Link to="/contact" className="hover:text-blue-300 transition duration-300">Contact</Link>
              <Link to="/products" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Products
              </Link>
            </div>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/cart" className="hover:text-blue-300 transition duration-300">
                <ShoppingCart className="h-6 w-6" />
              </Link>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="hover:text-blue-300 transition duration-300">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-300 transition duration-300">Login</Link>
                  <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-blue-800 py-2">
            <div className="container mx-auto px-4 flex flex-col space-y-3">
              <Link to="/" className="py-2 block hover:bg-blue-700 px-3 rounded">Home</Link>
              
              <div className="relative">
                <button
                  onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                  className="w-full text-left flex items-center justify-between py-2 hover:bg-blue-700 px-3 rounded"
                >
                  Products <ChevronDown className="h-4 w-4" />
                </button>
                
                {isProductsDropdownOpen && (
                  <div className="bg-blue-700 mt-1 py-2 px-4 rounded">
                    <Link to="/products/gases" className="block py-2 hover:bg-blue-600 px-2 rounded">Gases</Link>
                    <Link to="/products/accessories" className="block py-2 hover:bg-blue-600 px-2 rounded">Accessories</Link>
                  </div>
                )}
              </div>
              
              <Link to="/about" className="py-2 block hover:bg-blue-700 px-3 rounded">About Us</Link>
              <Link to="/contact" className="py-2 block hover:bg-blue-700 px-3 rounded">Contact</Link>
              <Link to="/cart" className="py-2 block hover:bg-blue-700 px-3 rounded flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" /> Cart
              </Link>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="py-2 block hover:bg-blue-700 px-3 rounded">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="py-2 block hover:bg-blue-700 px-3 rounded">Login</Link>
                  <Link to="/signup" className="py-2 block bg-blue-600 hover:bg-blue-700 px-3 rounded">Sign Up</Link>
                </>
              )}
              <Link 
                to="/products" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Products
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Premium Gas Solutions for Industries</h1>
              <p className="text-xl mb-8">Your trusted partner for industrial and specialty gases, equipment, and accessories.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-center transition duration-300">Browse Products</Link>
                <Link to="/contact" className="bg-transparent hover:bg-blue-800 border border-white text-white px-6 py-3 rounded-md font-medium text-center transition duration-300">Contact Us</Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-blue-700 rounded-lg p-6 w-full max-w-md h-64 flex items-center justify-center">
                <p className="text-center text-lg"><img src={img3} alt="logo" classname="w-110 h-60"/></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Gas Category */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="bg-blue-600 h-48 flex items-center justify-center">
                <p className="text-white text-lg"><img src={img1} alt="gas" classname="w-95 h-49"/></p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Industrial Gases</h3>
                <p className="text-gray-600 mb-4">High-quality industrial gases for manufacturing, healthcare, and research applications.</p>
                <Link to="/products/gases" className="text-blue-600 font-medium hover:text-blue-800">Explore Gases →</Link>
              </div>
            </div>
            
            {/* Accessories Category */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="bg-blue-700 h-48 flex items-center justify-center">
                <p className="text-white text-lg"><img src={acc} alt="accessories" classname="w-95 h-40"/></p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Gas Accessories</h3>
                <p className="text-gray-600 mb-4">Regulators, valves, fittings, and other essential accessories for gas management systems.</p>
                <Link to="/products/accessories" className="text-blue-600 font-medium hover:text-blue-800">Explore Accessories →</Link>
              </div>
            </div>
            
            {/* Services */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="bg-blue-800 h-48 flex items-center justify-center">
                <p className="text-white text-lg"><img src={img9} alt="img9" classname="w-95 h-49"/></p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Technical Services</h3>
                <p className="text-gray-600 mb-4">Professional installation, maintenance, and technical support for your gas systems.</p>
                <Link to="/services" className="text-blue-600 font-medium hover:text-blue-800">Learn More →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-6">About Nelson Enterprises</h2>
              <p className="text-gray-700 mb-4">
                Founded in 1995, Nelson Enterprises has been a trusted provider of industrial gases and accessories for over 25 years. We pride ourselves on delivering high-quality products and exceptional service to businesses across various industries.
              </p>
              <p className="text-gray-700 mb-4">
                Our team of experts is committed to understanding your specific needs and providing tailored solutions that help optimize your operations and improve efficiency.
              </p>
              <p className="text-gray-700">
                At Nelson Enterprises, safety and reliability are our top priorities. We adhere to the highest industry standards to ensure that all our products meet rigorous quality and safety requirements.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-gray-200 rounded-lg p-6 w-full max-w-md h-64 flex items-center justify-center">
                <p className="text-center text-gray-600"><img src={img8} alt="company" classname="w-102 h-55"/></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">"Nelson Enterprises has been our trusted gas supplier for over 10 years. Their products are reliable and their customer service is exceptional."</p>
              <p className="font-medium">— John Smith, ABC Manufacturing</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">"The technical expertise of the Nelson team has been invaluable in helping us optimize our gas systems and improve safety protocols."</p>
              <p className="font-medium">— Sarah Johnson, XYZ Industries</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">"Prompt delivery and high-quality products make Nelson Enterprises our go-to supplier for all our industrial gas needs."</p>
              <p className="font-medium">— Michael Brown, Brown's Welding</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Contact our team today to discuss your gas and accessories requirements. We're here to provide the solutions you need.</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/contact" className="bg-white text-blue-900 hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition duration-300">Contact Us</Link>
            <Link to="/products" className="bg-transparent hover:bg-blue-800 border border-white px-6 py-3 rounded-md font-medium transition duration-300">Explore Products</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Nelson Enterprises</h3>
              <p className="mb-4">Your trusted partner for industrial gases and accessories since 1995.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><Link to="/products/gases" className="hover:text-white">Industrial Gases</Link></li>
                <li><Link to="/products/gases" className="hover:text-white">Specialty Gases</Link></li>
                <li><Link to="/products/accessories" className="hover:text-white">Gas Regulators</Link></li>
                <li><Link to="/products/accessories" className="hover:text-white">Valves & Fittings</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="not-italic">
                <p>176, Narammala</p>
                <p>Kurunegala</p>
                <p className="mt-3">Phone: (777) 123-4567</p>
                <p>Email: info@nelsongas.com</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Nelson Enterprises. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
