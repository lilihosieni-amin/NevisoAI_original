// Shared inline SVG icons — minimal outline style, currentColor-driven.
// Use: <Icon name="mic" size={16} /> OR <MicIcon size={16}/>
// stroke prop overrides currentColor.

const _icon = (paths) => ({ size = 16, stroke, fill = 'none', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke || 'currentColor'} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {paths}
  </svg>
);

const MicIcon = _icon(<>
  <rect x="9" y="3" width="6" height="12" rx="3"/>
  <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>
</>);

const CameraIcon = _icon(<>
  <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H8l1.5-2h5L16 7h3.5A1.5 1.5 0 0 1 21 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>
  <circle cx="12" cy="13" r="3.5"/>
</>);

const ChatIcon = _icon(<>
  <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.7-5.4A8 8 0 1 1 21 12z"/>
</>);

const BellIcon = _icon(<>
  <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7zM9.5 20a2.5 2.5 0 0 0 5 0"/>
</>);

const PdfIcon = _icon(<>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
  <path d="M14 3v5h5"/>
  <path d="M9 13h6M9 17h4"/>
</>);

const FolderIcon = _icon(<>
  <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
</>);

const FolderMoveIcon = _icon(<>
  <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <path d="M12 12v5M9.5 14.5 12 17l2.5-2.5"/>
</>);

const CalendarIcon = _icon(<>
  <rect x="3.5" y="5" width="17" height="16" rx="2"/>
  <path d="M3.5 10h17M8 3v4M16 3v4"/>
</>);

const DoorIcon = _icon(<>
  <path d="M14 21V3H6v18M14 21h4M14 21H6M14 12h.01"/>
</>);

const GlobeIcon = _icon(<>
  <circle cx="12" cy="12" r="9"/>
  <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/>
</>);

const LockIcon = _icon(<>
  <rect x="4" y="11" width="16" height="10" rx="2"/>
  <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
</>);

const UserIcon = _icon(<>
  <circle cx="12" cy="8" r="4"/>
  <path d="M4 21a8 8 0 0 1 16 0"/>
</>);

const InfoIcon = _icon(<>
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 11v6M12 8v.01"/>
</>);

const AlertIcon = _icon(<>
  <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/>
  <path d="M12 9v4M12 17h.01"/>
</>);

const PlayIcon = _icon(<>
  <path d="M6 4 19 12 6 20z" fill="currentColor" strokeLinejoin="round"/>
</>);

const SendIcon = _icon(<>
  <path d="M3 11 21 3l-7 18-3-8z"/>
  <path d="M11 13 21 3"/>
</>);

const StarIcon = _icon(<>
  <path d="m12 3 2.7 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.5 6.5 20.4l1.1-6.3L3 9.6l6.3-.9z" fill="currentColor"/>
</>);

const ClockIcon = _icon(<>
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 7v5l3 2"/>
</>);

const TrashIcon = _icon(<>
  <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v6M14 11v6"/>
</>);

const BooksIcon = _icon(<>
  <path d="M4 4h6v17H4zM10 4h6v17h-6z"/>
  <path d="M16 6.5l3.8-.7 2.7 16.5-3.8.7z"/>
</>);

const CheckIcon = _icon(<>
  <path d="m5 12 5 5L20 7"/>
</>);

// Sparkle (replaces ✦) — four-point star, used for AI moments
const SparkIcon = _icon(<>
  <path d="M12 3v6M12 15v6M3 12h6M15 12h6" strokeLinecap="round"/>
  <path d="M12 9c0 1.5 1.5 3 3 3-1.5 0-3 1.5-3 3 0-1.5-1.5-3-3-3 1.5 0 3-1.5 3-3z" fill="currentColor" strokeLinejoin="round"/>
</>);

// Smaller sparkle for chips / inline
const SparkSmall = ({ size = 12, stroke }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill={stroke || 'currentColor'} style={{ flexShrink: 0 }}>
    <path d="M6 0 7.2 4.8 12 6 7.2 7.2 6 12 4.8 7.2 0 6 4.8 4.8z"/>
  </svg>
);

const NotebookIconShared = ({ size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5z"/>
    <path d="M5 7h2M5 11h2M5 15h2M5 19h2"/>
  </svg>
);

const ImageIcon = _icon(<>
  <rect x="3" y="4" width="18" height="16" rx="2"/>
  <circle cx="9" cy="10" r="1.5"/>
  <path d="m21 16-5-5L7 20"/>
</>);

const FilterIcon = _icon(<>
  <path d="M3 5h18l-7 9v6l-4-2v-4z"/>
</>);

const SearchIcon = _icon(<>
  <circle cx="11" cy="11" r="7"/>
  <path d="m20 20-3.5-3.5"/>
</>);

const CoinIcon = _icon(<>
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 7v10M9.5 9.2a2.2 2.2 0 0 1 2.2-1.7h.6a2.1 2.1 0 0 1 0 4.2h-1.6a2.1 2.1 0 0 0 0 4.2h.6a2.2 2.2 0 0 0 2.2-1.7"/>
</>);

// Back arrow for RTL (points right). Use stroke for color.
const BackIcon = _icon(<>
  <path d="M5 12h14M13 6l6 6-6 6"/>
</>);

// Forward/continue arrow for RTL (points left).
const FwdIcon = _icon(<>
  <path d="M19 12H5M11 6l-6 6 6 6"/>
</>);

// Small chevron down (for sort / dropdowns)
const ChevDown = _icon(<>
  <path d="M6 9l6 6 6-6"/>
</>);

// Close / cancel X
const XIcon = _icon(<>
  <path d="M6 6l12 12M18 6L6 18"/>
</>);

// Plus / add
const PlusIcon = _icon(<>
  <path d="M12 5v14M5 12h14"/>
</>);

Object.assign(window, {
  MicIcon, CameraIcon, ChatIcon, BellIcon, PdfIcon,
  FolderIcon, FolderMoveIcon, CalendarIcon, DoorIcon, GlobeIcon,
  LockIcon, UserIcon, InfoIcon, AlertIcon, PlayIcon, SendIcon,
  StarIcon, ClockIcon, TrashIcon, BooksIcon, CheckIcon,
  SparkIcon, SparkSmall, NotebookIconShared, ImageIcon, FilterIcon, SearchIcon, CoinIcon, BackIcon, FwdIcon, ChevDown, XIcon, PlusIcon,
});
