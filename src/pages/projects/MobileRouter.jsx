import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getProjectByPath } from '../../data/projects.js'
import CountUp from '../../components/CountUp.jsx'
import './MobileRouter.css'

function Placeholder({ name, aspect = '16/9', color }) {
  return (
    <div className="placeholder" style={{ aspectRatio: aspect, backgroundColor: color }}>
      <span>{name}</span>
    </div>
  )
}

const project = getProjectByPath('/projects/mobile-router')

// Aside lower-block content. Same source for both views — team list while
// the user is on the first screen, TOC once they've scrolled past it.
const TEAM = [
  { role: 'My Role', who: 'Primary Product Designer' },
  { role: 'Design Lead', who: 'Mark Ke' },
  { role: 'FE. Dev.', who: 'Arel Lin, Otis Yang' },
  { role: 'BE. Dev.', who: 'Ray Shih, Hank Wu' },
  { role: 'Cloud Dev.', who: 'Alfredo Ruan' },
  { role: 'Product Owner', who: 'David Lin, Lynn Chao' },
]

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'zero-touch', label: 'Zero-Touch Setup' },
  { id: 'scalable', label: 'Scalable Config' },
  { id: 'integration', label: 'Integration with UniFi' },
  { id: 'device-insights', label: 'Insight Visualization' },
  { id: 'outcome', label: 'Outcome' },
]

// ============================================================================
// SCALABLE CONFIGURATION diagram — recreated from the Figma frame
// "Scalable Config" (4019:21935). A config profile (terminal-style list) at
// the top pushes settings down dashed connectors that fan out to five UniFi
// devices; each device emits ripples on its own cadence. The SVG viewBox
// matches the Figma frame (4292×2714), so every coordinate below is
// frame-relative. Mirrors the StreamingDiagram approach: device line-art is
// authored as filled even-odd paths, connectors are marching dashes, and the
// ripples are CSS-animated circles. Device paths exported straight from the
// three unique router glyphs (3-antenna, 2-antenna AP, V-antenna).
// ============================================================================
const D_ROUTER3 = 'M 69.599609375 294.2001953125 L 61.599609375 294.2001953125 L 61.599609375 300 L 140.7998046875 300 L 140.7998046875 294.2001953125 L 132.7998046875 294.2001953125 L 132.7998046875 257.400390625 L 180.7998046875 257.400390625 L 180.7998046875 294.2001953125 L 173.599609375 294.2001953125 L 173.599609375 300 L 252.7998046875 300 L 252.7998046875 294.2001953125 L 244.7998046875 294.2001953125 L 244.7998046875 257.400390625 L 292.7998046875 257.400390625 L 292.7998046875 294.2001953125 L 285.599609375 294.2001953125 L 285.599609375 300 L 314.400390625 300 L 314.400390625 662.400390625 L 314.39453125 663.2275390625 C 313.9549202620983 697.9169235229492 285.9169273376465 725.9549506008625 251.2275390625 726.39453125 L 250.400390625 726.400390625 L 64 726.400390625 L 63.1728515625 726.39453125 C 28.483238220214844 725.9551862180233 0.4444648027420044 697.9170951843262 0.0048828125 663.2275390625 L 0 662.400390625 L 0 300 L 28.7998046875 300 L 28.7998046875 294.2001953125 L 21.599609375 294.2001953125 L 21.599609375 257.400390625 L 69.599609375 257.400390625 L 69.599609375 294.2001953125 Z M 4 662.400390625 C 4.000214435727685 695.5373001098633 30.863052368164062 722.400390625 64 722.400390625 L 250.400390625 722.400390625 C 283.53713607788086 722.4001844380691 310.4001514798729 695.5371437072754 310.400390625 662.400390625 L 310.400390625 592 L 4 592 L 4 662.400390625 Z M 4 588 L 33.2001953125 588 L 33.2001953125 304.400390625 L 37.2001953125 304.400390625 L 37.2001953125 588 L 43.599609375 588 L 43.599609375 304.400390625 L 47.599609375 304.400390625 L 47.599609375 588 L 54 588 L 54 304.400390625 L 58 304.400390625 L 58 588 L 64.400390625 588 L 64.400390625 304.400390625 L 68.400390625 304.400390625 L 68.400390625 588 L 74.7998046875 588 L 74.7998046875 304.400390625 L 78.7998046875 304.400390625 L 78.7998046875 588 L 85.2001953125 588 L 85.2001953125 304.400390625 L 89.2001953125 304.400390625 L 89.2001953125 588 L 225.2001953125 588 L 225.2001953125 304.400390625 L 229.2001953125 304.400390625 L 229.2001953125 588 L 235.599609375 588 L 235.599609375 304.400390625 L 239.599609375 304.400390625 L 239.599609375 588 L 246 588 L 246 304.400390625 L 250 304.400390625 L 250 588 L 256.400390625 588 L 256.400390625 304.400390625 L 260.400390625 304.400390625 L 260.400390625 588 L 266.7998046875 588 L 266.7998046875 304.400390625 L 270.7998046875 304.400390625 L 270.7998046875 588 L 277.2001953125 588 L 277.2001953125 304.400390625 L 281.2001953125 304.400390625 L 281.2001953125 588 L 310.400390625 588 L 310.400390625 304 L 4 304 L 4 588 Z M 32.7998046875 300 L 57.599609375 300 L 57.599609375 294.400390625 L 32.7998046875 294.400390625 L 32.7998046875 300 Z M 144.7998046875 300 L 169.599609375 300 L 169.599609375 294.400390625 L 144.7998046875 294.400390625 L 144.7998046875 300 Z M 256.7998046875 300 L 281.599609375 300 L 281.599609375 294.400390625 L 256.7998046875 294.400390625 L 256.7998046875 300 Z M 25.599609375 290.2001953125 L 65.599609375 290.2001953125 L 65.599609375 261.400390625 L 25.599609375 261.400390625 L 25.599609375 290.2001953125 Z M 136.7998046875 290.2001953125 L 176.7998046875 290.2001953125 L 176.7998046875 261.400390625 L 136.7998046875 261.400390625 L 136.7998046875 290.2001953125 Z M 248.7998046875 290.2001953125 L 288.7998046875 290.2001953125 L 288.7998046875 261.400390625 L 248.7998046875 261.400390625 L 248.7998046875 290.2001953125 Z M 66.400390625 253.2001953125 L 24 253.2001953125 L 32 0 L 58.400390625 0 L 66.400390625 253.2001953125 Z M 178.400390625 253.2001953125 L 136 253.2001953125 L 144 0 L 170.400390625 0 L 178.400390625 253.2001953125 Z M 290.400390625 253.2001953125 L 248 253.2001953125 L 256 0 L 282.400390625 0 L 290.400390625 253.2001953125 Z M 28.1279296875 249.2001953125 L 62.2724609375 249.2001953125 L 54.5244140625 4 L 35.8759765625 4 L 28.1279296875 249.2001953125 Z M 140.1279296875 249.2001953125 L 174.2724609375 249.2001953125 L 166.5244140625 4 L 147.8759765625 4 L 140.1279296875 249.2001953125 Z M 252.1279296875 249.2001953125 L 286.2724609375 249.2001953125 L 278.5244140625 4 L 259.8759765625 4 L 252.1279296875 249.2001953125 Z'
const D_AP2 = 'M 61.6005859375 716.400390625 L 18.400390625 716.400390625 L 13.6005859375 634 L 66.400390625 634 L 61.6005859375 716.400390625 Z M 22.173828125 712.400390625 L 57.8271484375 712.400390625 L 62.1611328125 638 L 17.83984375 638 L 22.173828125 712.400390625 Z M 64.87109375 316.599609375 L 244.0712890625 316.599609375 L 244 284 L 292.7998046875 284 L 292.87109375 316.599609375 L 308 316.599609375 L 308 592.599609375 L 66.400390625 592.599609375 L 66.400390625 631 L 13.6005859375 631 L 13.6005859375 592.599609375 L 0 592.599609375 L 0 316.599609375 L 16.0712890625 316.599609375 L 16 284 L 64.7998046875 284 L 64.87109375 316.599609375 Z M 17.6005859375 627 L 62.400390625 627 L 62.400390625 592.599609375 L 17.6005859375 592.599609375 L 17.6005859375 627 Z M 4 588.599609375 L 16.400390625 588.599609375 L 16.400390625 320.599609375 L 4 320.599609375 L 4 588.599609375 Z M 20.400390625 588.599609375 L 34.400390625 588.599609375 L 34.400390625 320.599609375 L 20.400390625 320.599609375 L 20.400390625 588.599609375 Z M 38.400390625 588.599609375 L 52.400390625 588.599609375 L 52.400390625 320.599609375 L 38.400390625 320.599609375 L 38.400390625 588.599609375 Z M 56.400390625 588.599609375 L 70.400390625 588.599609375 L 70.400390625 320.599609375 L 56.400390625 320.599609375 L 56.400390625 588.599609375 Z M 74.400390625 588.599609375 L 233.6005859375 588.599609375 L 233.6005859375 320.599609375 L 74.400390625 320.599609375 L 74.400390625 588.599609375 Z M 237.6005859375 588.599609375 L 251.6005859375 588.599609375 L 251.6005859375 320.599609375 L 237.6005859375 320.599609375 L 237.6005859375 588.599609375 Z M 255.6005859375 588.599609375 L 269.6005859375 588.599609375 L 269.6005859375 320.599609375 L 255.6005859375 320.599609375 L 255.6005859375 588.599609375 Z M 273.6005859375 588.599609375 L 287.6005859375 588.599609375 L 287.6005859375 320.599609375 L 273.6005859375 320.599609375 L 273.6005859375 588.599609375 Z M 291.6005859375 588.599609375 L 304 588.599609375 L 304 320.599609375 L 291.6005859375 320.599609375 L 291.6005859375 588.599609375 Z M 20.0712890625 316.5 L 60.87109375 316.5 L 60.80859375 288 L 20.0087890625 288 L 20.0712890625 316.5 Z M 248.0712890625 316.5 L 288.87109375 316.5 L 288.80859375 288 L 248.0087890625 288 L 248.0712890625 316.5 Z M 64.7998046875 280.7998046875 L 16 280.7998046875 L 24 0 L 56.7998046875 0 L 64.7998046875 280.7998046875 Z M 20.115234375 276.7998046875 L 60.6845703125 276.7998046875 L 52.912109375 4 L 27.8876953125 4 L 20.115234375 276.7998046875 Z M 292.7998046875 280.7998046875 L 244 280.7998046875 L 252 0 L 284.7998046875 0 L 292.7998046875 280.7998046875 Z M 248.115234375 276.7998046875 L 288.6845703125 276.7998046875 L 280.912109375 4 L 255.8876953125 4 L 248.115234375 276.7998046875 Z'
const D_ROUTERV = 'M 647.736328125 4.68654203414917 C 652.0261726379395 0.39672327041625977 658.3736801147461 -1.0976900458335876 664.126953125 0.8271672129631042 L 696.3408203125 11.605487823486328 C 707.6129245758057 15.376880407333374 710.9829816818237 29.687917709350586 702.578125 38.09279251098633 L 439.3447265625 301.3242492675781 L 439.6865234375 304.2246398925781 C 439.688169072615 304.23834558576345 439.6907644229941 304.25194060150534 439.6923828125 304.2656555175781 L 445.1376953125 350.4101867675781 L 468.41015625 350.4101867675781 C 486.0832710266113 350.4101867675781 500.4101438600637 364.73707389831543 500.41015625 382.4101867675781 L 500.41015625 583.2099609375 C 500.41015625 600.8830852508545 486.08327865600586 615.2099609375 468.41015625 615.2099609375 L 239.61033630371094 615.2099609375 C 221.93723487854004 615.2099376923943 207.61033630371094 600.8830699920654 207.61033630371094 583.2099609375 L 207.61033630371094 382.4101867675781 C 207.61036319426057 365.0133171081543 221.49289894104004 350.85914742946625 238.78416442871094 350.4209289550781 L 239.61033630371094 350.4101867675781 L 262.880859375 350.4101867675781 L 268.59375 301.9922180175781 L 4.693346977233887 38.09279251098633 C -3.711400032043457 29.68802547454834 -0.34207916259765625 15.377103090286255 10.929675102233887 11.605487823486328 L 43.1445198059082 0.8271672129631042 C 48.89756727218628 -1.0974968075752258 55.24439859390259 0.3970522880554199 59.5341682434082 4.68654203414917 L 341.4580078125 286.6094055175781 L 365.8134765625 286.6094055175781 L 647.736328125 4.68654203414917 Z M 239.61033630371094 354.4101867675781 C 224.14638423919678 354.41019707574924 211.61036310565032 366.94622898101807 211.61033630371094 382.4101867675781 L 211.61033630371094 583.2099609375 C 211.61033630371094 598.6739168167114 224.14637088775635 611.2099382586803 239.61033630371094 611.2099609375 L 468.41015625 611.2099609375 C 483.87412452697754 611.2099609375 496.41015625 598.6739463806152 496.41015625 583.2099609375 L 496.41015625 382.4101867675781 C 496.4101438801499 366.94621753692627 483.87414741516113 354.4101867675781 468.41015625 354.4101867675781 L 239.61033630371094 354.4101867675781 Z M 288.1884765625 290.6094055175781 C 280.0772285461426 290.6094055175781 273.24838584661484 296.6790256500244 272.2978515625 304.7344055175781 L 266.9091796875 350.4092102050781 L 441.109375 350.4092102050781 L 435.7197265625 304.7344055175781 C 434.76917284727097 296.6791076660156 427.9412202835083 290.60948977763474 419.830078125 290.6094055175781 L 367.470703125 290.6094055175781 L 367.4697265625 290.6103820800781 L 339.8017578125 290.6103820800781 L 339.80078125 290.6094055175781 L 288.1884765625 290.6094055175781 Z M 56.7060432434082 7.51466703414917 C 53.488845109939575 4.297747611999512 48.72863960266113 3.1769323348999023 44.4140510559082 4.62013578414917 L 12.199206352233887 15.398456573486328 C 3.7455835342407227 18.22710371017456 1.2177810668945312 28.96095371246338 7.521471977233887 35.26466751098633 L 270.173828125 297.9160461425781 C 273.3635618686676 291.30804347991943 280.0492663383484 286.79450772702694 287.7138671875 286.6152648925781 L 288.1884765625 286.6094055175781 L 335.80078125 286.6094055175781 L 56.7060432434082 7.51466703414917 Z M 662.857421875 4.62013578414917 C 658.5424432754517 3.1766937971115112 653.7816119194031 4.29754376411438 650.564453125 7.51466703414917 L 371.470703125 286.6094055175781 L 419.830078125 286.6094055175781 C 427.4967050552368 286.60946922775474 434.24521112442017 290.94803953170776 437.5947265625 297.4170227050781 L 699.75 35.26466751098633 C 706.0535550117493 28.96106195449829 703.5254402160645 18.227022886276245 695.0712890625 15.398456573486328 L 662.857421875 4.62013578414917 Z'

// UniFi Console rack line-art, exported from the Figma "S2S VPN" frame
// (Union, 1502×182). Used by S2SVpnDiagram below.
const D_CONSOLE = 'M 489 38 C 491.20913887023926 38 492.9999999677867 39.79086112976074 493 42 L 493 140 C 493 142.20913887023926 491.20913887023926 144 489 144 L 179 144 L 178.7939453125 143.9951171875 C 176.7487998008728 143.89134941995144 175.10865197330713 142.25119996070862 175.0048828125 140.2060546875 L 175 140 L 175 42 C 175 39.8599636554718 176.6805591583252 38.11211436986923 178.7939453125 38.0048828125 L 179 38 L 489 38 Z M 179 140 L 489 140 L 489 42 L 179 42 L 179 140 Z M 828 38 C 830.2091388702393 38 831.9999999677857 39.79086112976074 832 42 L 832 140 C 832 142.20913887023926 830.2091388702393 144 828 144 L 518 144 L 517.7939453125 143.9951171875 C 515.7487998008728 143.89134941995144 514.1086519733071 142.25119996070862 514.0048828125 140.2060546875 L 514 140 L 514 42 C 514 39.8599636554718 515.6805591583252 38.11211436986923 517.7939453125 38.0048828125 L 518 38 L 828 38 Z M 518 140 L 828 140 L 828 42 L 518 42 L 518 140 Z M 1086.2060546875 104.0048828125 C 1088.3194403648376 104.11211510002613 1089.9999999687943 105.85996389389038 1090 108 L 1090 140 L 1089.9951171875 140.2060546875 C 1089.8913474678993 142.25119853019714 1088.2511985301971 143.8913478627801 1086.2060546875 143.9951171875 L 1086 144 L 1054 144 C 1051.859964132309 143.99999950071714 1050.1121146902442 142.31944060325623 1050.0048828125 140.2060546875 L 1050 140 L 1050 108 C 1050.0000005154127 105.7908616065979 1051.7908613681793 104.00000003221282 1054 104 L 1086 104 L 1086.2060546875 104.0048828125 Z M 1054 140 L 1086 140 L 1086 108 L 1054 108 L 1054 140 Z M 1148.2060546875 104.0048828125 C 1150.3194403648376 104.11211510002613 1151.9999999687943 105.85996389389038 1152 108 L 1152 140 L 1151.9951171875 140.2060546875 C 1151.8913474678993 142.25119853019714 1150.2511985301971 143.8913478627801 1148.2060546875 143.9951171875 L 1148 144 L 1116 144 C 1113.859964132309 143.99999950071714 1112.1121146902442 142.31944060325623 1112.0048828125 140.2060546875 L 1112 140 L 1112 108 C 1112.0000005154127 105.7908616065979 1113.7908613681793 104.00000003221282 1116 104 L 1148 104 L 1148.2060546875 104.0048828125 Z M 1116 140 L 1148 140 L 1148 108 L 1116 108 L 1116 140 Z M 1216.2060546875 104.0048828125 C 1218.3194403648376 104.11211510002613 1219.9999999687943 105.85996389389038 1220 108 L 1220 140 L 1219.9951171875 140.2060546875 C 1219.8913474678993 142.25119853019714 1218.2511985301971 143.8913478627801 1216.2060546875 143.9951171875 L 1216 144 L 1184 144 C 1181.859964132309 143.99999950071714 1180.1121146902442 142.31944060325623 1180.0048828125 140.2060546875 L 1180 140 L 1180 108 C 1180.0000005154127 105.7908616065979 1181.7908613681793 104.00000003221282 1184 104 L 1216 104 L 1216.2060546875 104.0048828125 Z M 1184 140 L 1216 140 L 1216 108 L 1184 108 L 1184 140 Z M 1278.2060546875 104.0048828125 C 1280.3194403648376 104.11211510002613 1281.9999999687943 105.85996389389038 1282 108 L 1282 140 L 1281.9951171875 140.2060546875 C 1281.8913474678993 142.25119853019714 1280.2511985301971 143.8913478627801 1278.2060546875 143.9951171875 L 1278 144 L 1246 144 C 1243.859964132309 143.99999950071714 1242.1121146902442 142.31944060325623 1242.0048828125 140.2060546875 L 1242 140 L 1242 108 C 1242.0000005154127 105.7908616065979 1243.7908613681793 104.00000003221282 1246 104 L 1278 104 L 1278.2060546875 104.0048828125 Z M 1246 140 L 1278 140 L 1278 108 L 1246 108 L 1246 140 Z M 1382.2060546875 104.0048828125 C 1384.3194403648376 104.11211510002613 1385.9999999687943 105.85996389389038 1386 108 L 1386 140 L 1385.9951171875 140.2060546875 C 1385.8913474678993 142.25119853019714 1384.2511985301971 143.8913478627801 1382.2060546875 143.9951171875 L 1382 144 L 1350 144 C 1347.859964132309 143.99999950071714 1346.1121146902442 142.31944060325623 1346.0048828125 140.2060546875 L 1346 140 L 1346 108 C 1346.0000005154127 105.7908616065979 1347.7908613681793 104.00000003221282 1350 104 L 1382 104 L 1382.2060546875 104.0048828125 Z M 1350 140 L 1382 140 L 1382 108 L 1350 108 L 1350 140 Z M 1444.2060546875 104.0048828125 C 1446.3194403648376 104.11211510002613 1447.9999999687943 105.85996389389038 1448 108 L 1448 140 L 1447.9951171875 140.2060546875 C 1447.8913474678993 142.25119853019714 1446.2511985301971 143.8913478627801 1444.2060546875 143.9951171875 L 1444 144 L 1412 144 C 1409.859964132309 143.99999950071714 1408.1121146902442 142.31944060325623 1408.0048828125 140.2060546875 L 1408 140 L 1408 108 C 1408.0000005154127 105.7908616065979 1409.7908613681793 104.00000003221282 1412 104 L 1444 104 L 1444.2060546875 104.0048828125 Z M 1412 140 L 1444 140 L 1444 108 L 1412 108 L 1412 140 Z M 128 52 C 130.20913887023926 52 131.99999997181337 53.79086112976074 132 56 L 132 126 C 132 128.1400363445282 130.3194408416748 129.88788536190987 128.2060546875 129.9951171875 L 128 130 L 58 130 L 57.7939453125 129.9951171875 C 55.7488009929657 129.89134804159403 54.10865208506584 128.2511990070343 54.0048828125 126.2060546875 L 54 126 L 54 56 C 54 53.79086112976074 55.79086112976074 52.00000002818621 58 52 L 128 52 Z M 58 126 L 128 126 L 128 56 L 58 56 L 58 126 Z M 1086.2060546875 43.0048828125 C 1088.3194403648376 43.11211510002613 1089.9999999687943 44.85996389389038 1090 47 L 1090 79 L 1089.9951171875 79.2060546875 C 1089.8913474678993 81.25119853019714 1088.2511985301971 82.8913478627801 1086.2060546875 82.9951171875 L 1086 83 L 1054 83 C 1051.859964132309 82.99999950071714 1050.1121146902442 81.31944060325623 1050.0048828125 79.2060546875 L 1050 79 L 1050 47 C 1050.0000005154127 44.7908616065979 1051.7908613681793 43.000000032212824 1054 43 L 1086 43 L 1086.2060546875 43.0048828125 Z M 1054 79 L 1086 79 L 1086 47 L 1054 47 L 1054 79 Z M 1148.2060546875 43.0048828125 C 1150.3194403648376 43.11211510002613 1151.9999999687943 44.85996389389038 1152 47 L 1152 79 L 1151.9951171875 79.2060546875 C 1151.8913474678993 81.25119853019714 1150.2511985301971 82.8913478627801 1148.2060546875 82.9951171875 L 1148 83 L 1116 83 C 1113.859964132309 82.99999950071714 1112.1121146902442 81.31944060325623 1112.0048828125 79.2060546875 L 1112 79 L 1112 47 C 1112.0000005154127 44.7908616065979 1113.7908613681793 43.000000032212824 1116 43 L 1148 43 L 1148.2060546875 43.0048828125 Z M 1116 79 L 1148 79 L 1148 47 L 1116 47 L 1116 79 Z M 1216.2060546875 43.0048828125 C 1218.3194403648376 43.11211510002613 1219.9999999687943 44.85996389389038 1220 47 L 1220 79 L 1219.9951171875 79.2060546875 C 1219.8913474678993 81.25119853019714 1218.2511985301971 82.8913478627801 1216.2060546875 82.9951171875 L 1216 83 L 1184 83 C 1181.859964132309 82.99999950071714 1180.1121146902442 81.31944060325623 1180.0048828125 79.2060546875 L 1180 79 L 1180 47 C 1180.0000005154127 44.7908616065979 1181.7908613681793 43.000000032212824 1184 43 L 1216 43 L 1216.2060546875 43.0048828125 Z M 1184 79 L 1216 79 L 1216 47 L 1184 47 L 1184 79 Z M 1278.2060546875 43.0048828125 C 1280.3194403648376 43.11211510002613 1281.9999999687943 44.85996389389038 1282 47 L 1282 79 L 1281.9951171875 79.2060546875 C 1281.8913474678993 81.25119853019714 1280.2511985301971 82.8913478627801 1278.2060546875 82.9951171875 L 1278 83 L 1246 83 C 1243.859964132309 82.99999950071714 1242.1121146902442 81.31944060325623 1242.0048828125 79.2060546875 L 1242 79 L 1242 47 C 1242.0000005154127 44.7908616065979 1243.7908613681793 43.000000032212824 1246 43 L 1278 43 L 1278.2060546875 43.0048828125 Z M 1246 79 L 1278 79 L 1278 47 L 1246 47 L 1246 79 Z M 1444.2060546875 43.0048828125 C 1446.3194403648376 43.11211510002613 1447.9999999687943 44.85996389389038 1448 47 L 1448 79 L 1447.9951171875 79.2060546875 C 1447.8913474678993 81.25119853019714 1446.2511985301971 82.8913478627801 1444.2060546875 82.9951171875 L 1444 83 L 1412 83 C 1409.859964132309 82.99999950071714 1408.1121146902442 81.31944060325623 1408.0048828125 79.2060546875 L 1408 79 L 1408 47 C 1408.0000005154127 44.7908616065979 1409.7908613681793 43.000000032212824 1412 43 L 1444 43 L 1444.2060546875 43.0048828125 Z M 1412 79 L 1444 79 L 1444 47 L 1412 47 L 1412 79 Z M 1498.2060546875 0.0048828125 C 1500.3194286823273 0.112129345536232 1501.9999999473398 1.859973669052124 1502 4 L 1502 178 C 1502 180.20913887023926 1500.2091388702393 182 1498 182 L 4 182 C 1.8599770069122314 181.99998452234104 0.11211591213941574 180.31943106651306 0.0048828125 178.2060546875 L 0 178 L 0 4 C 0 1.8599636554718018 1.6805591583251953 0.11211452633142471 3.7939453125 0.0048828125 L 4 0 L 1498 0 L 1498.2060546875 0.0048828125 Z M 4 178 L 1498 178 L 1498 4 L 4 4 L 4 178 Z'

// Five devices: 3-antenna router, 2-antenna AP, V-antenna router, then the
// 3-antenna and 2-antenna glyphs reused on the right. cx is the device's
// horizontal centre (ripple origin); dur/delay give each its own cadence.
const CONFIG_DEVICES = [
  { d: D_ROUTER3, x: 357,  y: 1574, cx: 514,  dur: 2.6, delay: 0 },
  { d: D_AP2,     x: 1109, y: 1584, cx: 1263, dur: 3.3, delay: 0.6 },
  { d: D_ROUTERV, x: 1792, y: 1594, cx: 2148, dur: 2.2, delay: 0.25 },
  { d: D_ROUTER3, x: 2876, y: 1574, cx: 3033, dur: 2.9, delay: 0.9 },
  { d: D_AP2,     x: 3628, y: 1584, cx: 3782, dur: 3.6, delay: 0.4 },
]
const CONFIG_RIPPLE_CY = 2037

// Org-chart fan: a shared stem drops from the profile (hub) to the branch
// level, then curves out to each device column with a large rounded corner
// (radius CONFIG_CORNER_R — bump it for softer turns). The centre device
// gets a straight drop. Dashes march from the hub toward each device.
const CONFIG_HUB_X = 2148
const CONFIG_HUB_Y = 944
const CONFIG_BRANCH_Y = 1260
const CONFIG_DEVICE_TOP_Y = 1560
const CONFIG_CORNER_R = 90
function configElbow(dx) {
  const dir = dx > CONFIG_HUB_X ? 1 : -1
  const r = CONFIG_CORNER_R
  return [
    `M ${CONFIG_HUB_X} ${CONFIG_HUB_Y}`,
    `L ${CONFIG_HUB_X} ${CONFIG_BRANCH_Y - r}`,
    `Q ${CONFIG_HUB_X} ${CONFIG_BRANCH_Y} ${CONFIG_HUB_X + dir * r} ${CONFIG_BRANCH_Y}`,
    `L ${dx - dir * r} ${CONFIG_BRANCH_Y}`,
    `Q ${dx} ${CONFIG_BRANCH_Y} ${dx} ${CONFIG_BRANCH_Y + r}`,
    `L ${dx} ${CONFIG_DEVICE_TOP_Y}`,
  ].join(' ')
}
const CONFIG_CONNECTORS = [
  configElbow(514),
  configElbow(1263),
  'M 2148 944 L 2148 1720',
  configElbow(3033),
  configElbow(3782),
]

const CONFIG_ITEMS = ['VPN Configuration', 'Firewall Rules', 'Routing', 'DDNS']

// Terminal-style profile list: appends one line at a time and, once three are
// showing, flags the oldest so it fades out before being dropped next tick.
function ConfigTerminal() {
  const [lines, setLines] = useState([])
  // Single monotonic counter for both the unique key and the item index.
  // Advanced once per tick OUTSIDE the state updater so the updater stays
  // pure (React StrictMode double-invokes updaters; mutating a counter
  // inside would skip items).
  const tickRef = useRef(0)

  useEffect(() => {
    let timer
    const tick = () => {
      const n = tickRef.current++
      setLines((prev) => {
        // Drop any line that finished fading on the previous cycle.
        let arr = prev.filter((l) => !l.leaving)
        arr = [...arr, { id: n, label: CONFIG_ITEMS[n % CONFIG_ITEMS.length] }]
        // Once a fourth arrives, flag the oldest to fade out.
        if (arr.length > 3) arr = arr.map((l, i) => (i === 0 ? { ...l, leaving: true } : l))
        return arr
      })
      timer = setTimeout(tick, 1500)
    }
    timer = setTimeout(tick, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="config-terminal" aria-hidden="true">
      {lines.map((l) => (
        <div key={l.id} className={`config-line${l.leaving ? ' is-leaving' : ''}`}>
          <span className="config-text">{l.label}</span>
        </div>
      ))}
    </div>
  )
}

function ScalableConfigDiagram() {
  return (
    <div className="config-diagram">
      <svg
        viewBox="0 0 4292 2714"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="A reusable config profile pushed down to five UniFi devices"
      >
        {/* Ripples behind each device — two staggered rings per device, each
            device on its own duration/delay so the pulses stay out of sync. */}
        {CONFIG_DEVICES.map((dvc, i) =>
          [0, 1].map((r) => (
            <circle
              key={`ripple-${i}-${r}`}
              className="config-ripple"
              cx={dvc.cx}
              cy={CONFIG_RIPPLE_CY}
              style={{
                animationDuration: `${dvc.dur}s`,
                animationDelay: `${dvc.delay + r * (dvc.dur / 2)}s`,
              }}
            />
          ))
        )}

        {/* Marching dashed connectors (drawn before devices so the line ends
            tuck under each device glyph). */}
        {CONFIG_CONNECTORS.map((d, i) => (
          <path key={`conn-${i}`} className="config-conn" d={d} />
        ))}

        {/* Solid bus line under the profile. */}
        <line className="config-divider" x1="1786" y1="944" x2="2510" y2="944" />

        {/* Device line-art. */}
        {CONFIG_DEVICES.map((dvc, i) => (
          <path
            key={`dev-${i}`}
            className="config-device"
            transform={`translate(${dvc.x} ${dvc.y})`}
            fillRule="evenodd"
            clipRule="evenodd"
            d={dvc.d}
          />
        ))}

      </svg>

      <ConfigTerminal />
    </div>
  )
}

// ============================================================================
// REGULAR SITE-TO-SITE VPN diagram — recreated from the Figma frame
// "S2S VPN" (4019:22198). A UniFi Console (left) and a UniFi Mobile Router
// (right) sit either side of a "S2S VPN Tunnel" pill, joined by dashed lines
// that march (reusing .config-conn) to read as the tunnel carrying traffic.
// Each side lists the values that must be entered manually and kept in sync.
// viewBox matches the frame (4292×2100); labels/lists are SVG text so they
// scale crisply with the diagram width.
// ============================================================================
const S2S_CONSOLE_KEYS = ['IP of the Mobile Router', 'Private Key', 'Public Remote Key', 'Public Key']
const S2S_ROUTER_KEYS = ['IP of the console', 'Private Key', 'Public Remote Key', 'Public Key']

function S2SVpnDiagram() {
  return (
    <div className="config-diagram">
      <svg
        viewBox="0 160 4292 1500"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Regular site-to-site VPN setup: a UniFi Console and a UniFi Mobile Router linked by a VPN tunnel, each requiring manually matched IPs and keys"
      >
        {/* Devices either side of the tunnel. */}
        <path className="config-device" transform="translate(356 696)" fillRule="evenodd" clipRule="evenodd" d={D_CONSOLE} />
        <path className="config-device" transform="translate(3194 215)" fillRule="evenodd" clipRule="evenodd" d={D_ROUTER3} />

        {/* Marching dashes converging into the tunnel pill from both sides:
            the console line flows left → right, the router line right → left.
            Dashes march start → end, so each path is authored from its device
            toward the pill edge (2221 = pill left, 2832 = pill right). */}
        <path className="config-conn" d="M 1861 790 L 2221 790" />
        <path className="config-conn" d="M 3150 790 L 2832 790" />

        {/* Tunnel pill. */}
        <rect className="s2s-pill" x="2221" y="715" width="611" height="150" rx="75" />
        <text className="s2s-pill-text" x="2526" y="790" textAnchor="middle">S2S VPN Tunnel</text>

        {/* Left key list. Pulled up close under the devices; divider sits
            well clear of the text (64u gap). */}
        <line className="s2s-divider" x1="356" y1="1082" x2="356" y2="1530" />
        {S2S_CONSOLE_KEYS.map((k, i) => (
          <text key={k} className="s2s-item" x="420" y={1090 + i * 117}>{k}</text>
        ))}

        {/* Right key list. */}
        <line className="s2s-divider" x1="3194" y1="1082" x2="3194" y2="1530" />
        {S2S_ROUTER_KEYS.map((k, i) => (
          <text key={k} className="s2s-item" x="3258" y={1090 + i * 117}>{k}</text>
        ))}
      </svg>
    </div>
  )
}

function MobileRouter() {
  // Past-first-screen swap: team-info → TOC. Threshold = half viewport.
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  // Once the page-flip-in animation finishes, drop the transform from
  // .pp-shell so the sticky aside + TOC observer behave normally. We
  // also defer the IntersectionObserver registration until then so it
  // measures section positions in their final (un-rotated) layout.
  const [animDone, setAnimDone] = useState(false)

  // Match the duration in MobileRouter.css `.pp-shell` animation.
  useEffect(() => {
    const id = setTimeout(() => setAnimDone(true), 720)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the section currently in the middle of the viewport. Wait
  // until the flip animation has settled — observing while the page is
  // still rotating gives nonsense bounding boxes.
  useEffect(() => {
    if (!animDone) return
    const observers = []
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (!el) continue
      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) setActiveId(s.id)
          }
        },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [animDone])

  // Keep the active TOC item centered inside the horizontally-scrollable
  // .pp-toc bar (relevant on mobile where the TOC is fixed bottom and may
  // overflow). Scrolls only the bar, never the page.
  useEffect(() => {
    const toc = document.querySelector('.pp-toc')
    const active = toc?.querySelector('.pp-toc-item.is-active')
    if (!toc || !active) return
    const tocRect = toc.getBoundingClientRect()
    const itemRect = active.getBoundingClientRect()
    const offset =
      (itemRect.left + itemRect.width / 2) -
      (tocRect.left + tocRect.width / 2)
    if (Math.abs(offset) > 1) {
      toc.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }, [activeId])


  return (
    <>
      <Helmet>
        <title>UniFi Mobility | Sheng Pan</title>
        <meta
          name="description"
          content="Deploy secure networks for mobile and remote environments effortlessly."
        />
      </Helmet>

      <article className={`pp-shell pp-shell--blue-stats${animDone ? ' pp-shell--ready' : ''}`}>
        <aside className="pp-aside">
          <Link to="/" className="pp-back" aria-label="Back to home">←</Link>

          <header className="pp-aside-header">
            <h1 className="pp-name">UniFi Mobility</h1>
            <p className="pp-tagline">
              Deploy secure networks for mobile and remote environments
              effortlessly.
            </p>
            <p className="pp-eyebrow">Ubiquiti, 2022 – Present</p>
          </header>

          <div className="pp-aside-meta">
            {/* Both lists render simultaneously and overlap in the same grid
                cell (see CSS). `scrolled` flips which one is opacity:1 — the
                hidden one fades out while the other fades in. TOC items have
                a staggered enter via --i in inline style. */}
            <dl
              className={`pp-team${scrolled ? ' is-hidden' : ''}`}
              aria-hidden={scrolled || undefined}
            >
              {TEAM.map((t) => (
                <div className="pp-team-row" key={t.role}>
                  <dt>{t.role}</dt>
                  <dd>{t.who}</dd>
                </div>
              ))}
            </dl>
            <ul
              className={`pp-toc${scrolled ? '' : ' is-hidden'}`}
              aria-hidden={!scrolled || undefined}
            >
              {SECTIONS.map((s, i) => (
                <li
                  key={s.id}
                  className={`pp-toc-item${s.id === activeId ? ' is-active' : ''}`}
                  style={{ '--i': i }}
                >
                  <a href={`#${s.id}`} tabIndex={scrolled ? 0 : -1}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="pp-main">

          <div className="pp-hero">
            <Placeholder
              name="hero-mobile-router.jpg"
              aspect="5/4"
              color={project.color}
            />
          </div>

          <section id="overview" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>OVERVIEW</h2></div>
              <p className="section-body">
                We observed a growing market opportunity in outdoor, temporary,
                and mobile network deployment scenarios. UniFi Mobile Router
                was created to address challenges in cable-unreachable areas
                and on-the-move connectivity needs, enabling reliable internet
                access for vehicles, construction sites, and surveillance
                setups.
              </p>
            </div>
          </section>

          <section id="challenge" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>CHALLENGE</h2></div>
              <div className="challenge-grid">
                <div className="challenge-option">
                  <div className="challenge-option-body">
                    <h4>Tight Schedule</h4>
                    <p>
                      The project faced significant time pressure during
                      the hardware development phase, compressing the
                      software design and implementation timeline. The
                      team needed to make rapid design decisions, validate
                      feasibility, and stay aligned across global teams.
                    </p>
                  </div>
                </div>
                <div className="challenge-option">
                  <div className="challenge-option-body">
                    <h4>Market Latecomer</h4>
                    <p>
                      As a latecomer to the market, UniFi Mobile Router
                      faced the challenge of achieving feature parity with
                      established competitors. A key question emerged:
                      How could we differentiate and grow in an already
                      saturated market?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="zero-touch" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>
                ZERO-TOUCH SETUP IN MINUTES
              </h2></div>
              <p className="section-body">
                We streamlined the initial setup experience from QR scan and
                auto-pairing to cloud-based adopt.
              </p>
              <img
                className="pp-block-image"
                src="/mobility/zero-touch-setup-overview.jpg"
                alt="Zero-touch setup overview: QR scan → auto-pair → cloud adopt"
              />
            </div>

            <div className="pp-block">
              <h3>Scan QR Code To Activate</h3>
              <p>
                No activation code is needed. Pre-activated devices go live
                the moment they're powered on, delivering true zero-touch
                deployment so administrators and staff can stay focused on
                their core responsibilities.
              </p>
              <div className="pp-step-sequence">
                <video
                  className="pp-step-media"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Step 1: scan the device's QR code"
                >
                  <source src="/mobility/zero-touch-qr-scan-01.mp4" type="video/mp4" />
                </video>
                <span className="pp-step-arrow" aria-hidden="true">→</span>
                <video
                  className="pp-step-media"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Step 2: device is recognized and paired"
                >
                  <source src="/mobility/zero-touch-qr-scan-02.mp4" type="video/mp4" />
                </video>
                <span className="pp-step-arrow" aria-hidden="true">→</span>
                <video
                  className="pp-step-media"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Step 3: confirm placement and ownership"
                >
                  <source src="/mobility/zero-touch-qr-scan-03.mp4" type="video/mp4" />
                </video>
                <span className="pp-step-arrow" aria-hidden="true">→</span>
                <video
                  className="pp-step-media"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Step 4: device adopted into the cloud"
                >
                  <source src="/mobility/zero-touch-qr-scan-04.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="pp-block">
              <h3>Guidance On Locating Activation Code</h3>
              <p>
                When users activate their device via our activation page,
                we'll provide guidance on locating the activation code
                printed on its model.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Activation page guiding the user to the printed activation code on the device"
              >
                <source src="/mobility/activation-code-guidance.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="pp-block">
              <h3>Remote Management</h3>
              <p>
                Once adoption is complete and onsite staff finish
                installation, administrators can manage the devices entirely
                through our cloud-based Mobile Routing app.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Cloud-based remote management in the Mobile Routing app"
              >
                <source src="/mobility/remote-management.mp4" type="video/mp4" />
              </video>
            </div>
          </section>

          <section id="scalable" className="pp-section">
            <div className="section-heading"><h2>SCALABLE CONFIGURATION</h2></div>

            <div className="pp-block">
              <h3>
                Easily Push Configurations To Multiple Devices Using Reusable
                Profiles
              </h3>
              <p>
                Beyond typical remote management features, users can create
                and store Config Profiles via the Mobile Routing App and
                easily apply them across their UniFi Mobile Routers (UMRs).
              </p>
              <p>
                We observed that core functions like VPN, firewall rules,
                DDNS, and routing tend to share common configurations yet are
                often tedious to repeat. By introducing profile-based
                settings, users can save, reuse, and apply standardized
                setups at scale, simplifying network deployment and reducing
                manual errors.
              </p>
              <ScalableConfigDiagram />
            </div>

            <div className="pp-block">
              <h3>
                Example: Create A Site-To-Site VPN Profile And Apply To
                Multiple Devices
              </h3>
              <p>
                Beyond the standard remote management capabilities, the
                Mobile Routing App lets users define and store reusable
                Config Profiles, which can then be deployed across multiple
                UniFi Mobile Routers (UMRs).
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Creating a site-to-site VPN profile and applying it to multiple devices"
              >
                <source src="/mobility/s2s-vpn-profile.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="pp-block">
              <h3>Profile Overview</h3>
              <p>
                After creating a site-to-site VPN profile, users can visit
                the Overview page to see every existing profile and the
                devices to which each profile is applied.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Profile Overview page listing existing profiles and the devices they're applied to"
              >
                <source src="/mobility/profile-overview.mp4" type="video/mp4" />
              </video>
            </div>

            <div className="pp-block">
              <h3>Apply Profiles To A Single Device</h3>
              <p>
                In addition to batch management, users can flexibly apply
                settings to an individual device. From the Device List, open
                the target device's control panel and select an existing
                profile under the VPN or Firewall Rule sections to apply it
                instantly.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Applying a stored Config Profile to a single device from the Device List"
              >
                <source src="/mobility/apply-profile-single-device.mp4" type="video/mp4" />
              </video>
            </div>
          </section>

          <section id="integration" className="pp-section">
            <div className="section-heading"><h2>
              INTEGRATION WITH UNIFI ECOSYSTEM
            </h2></div>

            <div className="pp-block">
              <h3>Integrated Into UniFi Ecosystem To Create Synergy</h3>
              <p>
                UniFi Network is Ubiquiti's flagship platform, and most
                customers already operate a UniFi Console or compact Gateway.
                Bringing the Mobile Router into this ecosystem unlocks new
                remote-management scenarios for UniFi Network, beginning with
                seamless Site-to-Site VPN integration as the first milestone.
              </p>
            </div>

            <div className="pp-block">
              <h3>Regular Site-To-Site VPN Setup</h3>
              <p>
                In order to establish a site-to-site VPN connection, users
                have to enter the remote IP (which is the IP of the console),
                the private key of the console and the networks they want to
                access under the console. Also they generate the private key
                for Mobile Router and do the same things to the console on
                the other side.
              </p>
              <p>It's pretty frustrating. What if we could make it easier?</p>
              <S2SVpnDiagram />
            </div>

            <div className="pp-block">
              <h3>Make S2S VPN Setup Easy</h3>
              <p>
                Users benefit from the integration with the UniFi system by
                being able to select their UniFi console as the peer device
                when setting up a site-to-site VPN.
              </p>
              <p>
                Once the console is chosen, they can easily picking the
                correct associated subnet, minimizing configuration errors.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Simplified site-to-site VPN setup picking the UniFi console as the peer device"
              >
                <source src="/mobility/easy-s2s-vpn-setup.mp4" type="video/mp4" />
              </video>
            </div>
          </section>

          <section id="device-insights" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>DEVICE INSIGHTS VISUALIZATION</h2></div>
              <p className="section-body">
                The Mobile Router regularly reports its status to our cloud
                service, where historical data is aggregated and transformed
                into visual insights. This enables users to monitor network
                health, CPU status, and identify anomalies over time — even
                tracing back to when and why issues occurred.
              </p>
              <div className="pp-block-stack">
                <video
                  className="pp-block-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Device insights dashboard: network health, CPU and historical data"
                >
                  <source src="/mobility/device-insights-dashboard-01.mp4" type="video/mp4" />
                </video>
                <video
                  className="pp-block-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Device insights dashboard: drill-down on anomaly events over time"
                >
                  <source src="/mobility/device-insights-dashboard-02.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="pp-block">
              <h3>Locating Device On Map</h3>
              <p>
                Equipped with built-in GPS, the Mobile Router also shares its
                real-time location on a map, while storing its historical
                geolocation records. In the future, this can evolve into a
                full trace of its movement path for better operational
                visibility.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Mobile Router showing its real-time location and historical track on a map"
              >
                <source src="/mobility/device-map-location-01.mp4" type="video/mp4" />
              </video>
              <p>
                If there isn't enough room to show each device's location,
                pins will cluster together. This provides a high-level
                overview, making it more convenient for users or enterprises
                managing UniFi Mobile Routers globally.
              </p>
              <video
                className="pp-block-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Pin clustering on the device map for global Mobile Router fleets"
              >
                <source src="/mobility/device-map-location-02.mp4" type="video/mp4" />
              </video>
            </div>
          </section>

          <section id="outcome" className="pp-section">
            <div className="pp-section-intro">
              <div className="section-heading"><h2>OUTCOME</h2></div>
              <p className="section-body">
                Since launch, UniFi Mobile Router has been sold and deployed
                across multiple countries and regions, including North America,
                Europe, Asia, and Australia. To date, approximately 20,000
                units have been activated and are online.
              </p>
              <p className="section-body">
                About 62% of devices have subscribed to the Mobility service,
                with another 36% still in the free trial phase. This reflects
                a strong market acceptance and perceived value of our managed
                service model.
              </p>
            </div>
            <div className="outcome-stats">
              <div className="stat-card">
                <h3><CountUp end={20000} suffix="+ Devices" /></h3>
                <p>are online and activated.</p>
              </div>
              <div className="stat-card">
                <h3><CountUp end={62} suffix="% Devices" /></h3>
                <p>subscribed Mobility.</p>
              </div>
              <div className="stat-card">
                <h3><CountUp end={89} suffix="%+" /></h3>
                <p>Subscription retention rate.</p>
              </div>
            </div>
          </section>
        </main>
      </article>
    </>
  )
}

export default MobileRouter
