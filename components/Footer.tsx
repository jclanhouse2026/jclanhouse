
import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from './icons/HomeIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import { useHomeSettings } from '../context/HomeSettingsContext';

const Footer: React.FC = () => {
    const { settings } = useHomeSettings();
    const { footer } = settings;

    return (
        <footer className="bg-slate-800 border-t border-slate-700/50 text-slate-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="md:col-span-1">
                         <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white mb-2">
                            <HomeIcon className="w-6 h-6 text-cyan-400" />
                            <span>JC LAN HOUSE</span>
                        </Link>
                        <p className="text-sm text-slate-400">{footer.aboutText}</p>
                    </div>

                    {/* Site Links */}
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Site</h3>
                        <ul className="space-y-2">
                            {footer.siteLinks.map(link => (
                                <li key={link.id}><Link to={link.link} className="hover:text-white transition-colors">{link.text}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Links */}
                     <div>
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Principais Serviços</h3>
                        <ul className="space-y-2">
                            {footer.serviceLinks.map(link => (
                                <li key={link.id}><Link to={link.link} className="hover:text-white transition-colors">{link.text}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                     <div>
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-4">Contato</h3>
                        <ul className="space-y-2 text-slate-400">
                            <li>{footer.contact.email}</li>
                            <li>{footer.contact.phone}</li>
                            <li className="flex gap-4 pt-2">
                                <a href={footer.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-400 transition-colors">
                                    <WhatsappIcon className="w-6 h-6"/>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-slate-900 py-4">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} JC LAN HOUSE. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
