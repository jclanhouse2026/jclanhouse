
import React from 'react';

import PencilIcon from './icons/PencilIcon';
import PrinterIcon from './icons/PrinterIcon';
import GiftIcon from './icons/GiftIcon';
import SparklesIcon from './icons/SparklesIcon';
import BoltIcon from './icons/BoltIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import BookIcon from './icons/BookIcon';
import GraduationCapIcon from './icons/GraduationCapIcon';
import ReceiptIcon from './icons/ReceiptIcon';
import WalletIcon from './icons/WalletIcon';
import ListIcon from './icons/ListIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import TagIcon from './icons/TagIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import PhotographIcon from './icons/PhotographIcon';
import ImageIcon from './icons/ImageIcon';
import BookOpenIcon from './icons/BookIcon'; // Using BookIcon as fallback for BookOpen if needed or just use BookIcon
import DocumentIcon from './icons/DocumentIcon';

export const IconMap: { [key: string]: React.ElementType } = {
    PencilIcon,
    PrinterIcon,
    GiftIcon,
    SparklesIcon,
    BoltIcon,
    WhatsappIcon,
    BookIcon,
    GraduationCapIcon,
    ReceiptIcon,
    WalletIcon,
    ListIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    TagIcon,
    InformationCircleIcon,
    CreditCardIcon,
    PhotographIcon,
    ImageIcon,
    DocumentIcon,
};

export const iconOptions = Object.keys(IconMap).map(key => ({ value: key, label: key.replace('Icon', '') }));
