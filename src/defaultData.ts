import { Staff, TrainingProgress, ApprovalRecord } from './types';

export const DEFAULT_STAFF_LIST: Staff[] = [
  {
    id: 'staff-1779697586708',
    name: 'สิทธิศักดิ์ เลาหกุล',
    position: 'เจ้าพนักงานรังสีการแพทย์',
    department: 'กลุ่มงานรังสีเทคนิค',
    registeredAt: '2026-05-25T08:26:26.708Z'
  },
  {
    id: 'staff-1779697598741',
    name: 'ธีรพล เตจ๊ะเสาร์',
    position: 'ผู้ช่วยรังสีเทคนิค',
    department: 'กลุ่มงานรังสีเทคนิค',
    registeredAt: '2026-05-25T08:26:38.741Z'
  },
  {
    id: 'staff-1779697612230',
    name: 'เจษฎา จามิตร',
    position: 'ผู้ช่วยเหลือคนไข้',
    department: 'กลุ่มการพยาบาล',
    registeredAt: '2026-05-25T08:26:52.230Z'
  },
  {
    id: 'staff-1779697622607',
    name: 'ทณณชัย ดวงใจสัก',
    position: 'ผู้ช่วยเหลือคนไข้',
    department: 'กลุ่มการพยาบาล',
    registeredAt: '2026-05-25T08:27:02.607Z'
  },
  {
    id: 'staff-1779697632965',
    name: 'จักรพันธ์ นันตากาศ',
    position: 'ผู้ช่วยเหลือคนไข้',
    department: 'กลุ่มการพยาบาล',
    registeredAt: '2026-05-25T08:27:12.965Z'
  },
  {
    id: 'staff-1779697653326',
    name: 'วีระพงษ์ จอมเมืองกาศ',
    position: 'ผู้ช่วยเหลือคนไข้',
    department: 'กลุ่มการพยาบาล',
    registeredAt: '2026-05-25T08:27:33.326Z'
  },
  {
    id: 'staff-1779697660001',
    name: 'ปัฐวีพงษ์ มโนชมภู',
    position: 'ผู้ช่วยเหลือคนไข้',
    department: 'กลุ่มการพยาบาล',
    registeredAt: '2026-06-15T08:00:00.000Z'
  },
  {
    id: 'staff-1779697660002',
    name: 'อัครเดช พลอยพิมพ์',
    position: 'ผู้ช่วยเหลือคนไข้',
    department: 'กลุ่มการพยาบาล',
    registeredAt: '2026-06-21T08:00:00.000Z'
  }
];

export const DEFAULT_PROGRESS_LIST: TrainingProgress[] = [
  // สิทธิศักดิ์ เลาหกุล
  {
    staffId: 'staff-1779697586708',
    topicId: 'pdpa-radiology',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-04T07:57:35.227Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Sittisak</text></svg>'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'carestream-pacs',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-04T07:58:45.667Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Sittisak</text></svg>'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'daily-qa',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-04T07:59:39.054Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Sittisak</text></svg>'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'reject-analysis',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-04T08:00:25.294Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Sittisak</text></svg>'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'marker-tech',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-04T08:01:21.935Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Sittisak</text></svg>'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'positioning-transfer',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-04T08:02:02.627Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Sittisak</text></svg>'
  },
  // ธีรพล เตจ๊ะเสาร์
  {
    staffId: 'staff-1779697598741',
    topicId: 'daily-qa',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-09T07:55:37.480Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Teerapon</text></svg>'
  },
  {
    staffId: 'staff-1779697598741',
    topicId: 'marker-tech',
    status: 'completed',
    quizScore: 4,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-09T07:59:15.864Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Teerapon</text></svg>'
  },
  {
    staffId: 'staff-1779697598741',
    topicId: 'positioning-transfer',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-09T07:59:53.103Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Teerapon</text></svg>'
  },
  // เจษฎา จามิตร
  {
    staffId: 'staff-1779697612230',
    topicId: 'reject-analysis',
    status: 'completed',
    quizScore: 5,
    maxScore: 5,
    passed: true,
    completedAt: '2026-06-11T09:00:00.000Z',
    staffSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="22" fill="blue" font-style="italic">Jesada</text></svg>'
  }
];

export const DEFAULT_APPROVAL_LIST: ApprovalRecord[] = [
  // สิทธิศักดิ์ เลาหกุล (6 approved courses)
  {
    staffId: 'staff-1779697586708',
    topicId: 'carestream-pacs',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-04T09:00:00.000Z'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'pdpa-radiology',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-04T09:00:00.000Z'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'daily-qa',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-04T09:00:00.000Z'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'reject-analysis',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-04T09:00:00.000Z'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'marker-tech',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-04T09:00:00.000Z'
  },
  {
    staffId: 'staff-1779697586708',
    topicId: 'positioning-transfer',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-04T09:00:00.000Z'
  },
  // ธีรพล เตจ๊ะเสาร์ (3 approved courses)
  {
    staffId: 'staff-1779697598741',
    topicId: 'daily-qa',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-09T08:30:00.000Z'
  },
  {
    staffId: 'staff-1779697598741',
    topicId: 'marker-tech',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-09T08:30:00.000Z'
  },
  {
    staffId: 'staff-1779697598741',
    topicId: 'positioning-transfer',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-09T08:30:00.000Z'
  },
  // เจษฎา จามิตร (1 approved course)
  {
    staffId: 'staff-1779697612230',
    topicId: 'reject-analysis',
    headName: 'นายสิทธิศักดิ์ เลาหกุล',
    headPosition: 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
    headSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="35"><text x="10" y="25" font-family="cursive" font-size="20" fill="green" font-style="italic">Sittisak</text></svg>',
    approvedAt: '2026-06-11T09:30:00.000Z'
  }
];
