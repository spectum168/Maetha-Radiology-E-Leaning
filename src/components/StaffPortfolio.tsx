import { useRef } from 'react';
import { Staff, Topic, TrainingProgress } from '../types';
import { Printer, Calendar, ShieldCheck, CheckCircle2, User, BookOpen, Clock, Signature } from 'lucide-react';
import { MaethaLogo } from './MaethaLogo';

interface StaffPortfolioProps {
  staff: Staff;
  topics: Topic[];
  progressList: TrainingProgress[];
}

export function StaffPortfolio({ staff, topics, progressList }: StaffPortfolioProps) {
  const portfolioRef = useRef<HTMLDivElement | null>(null);

  // Filter progress for this active staff
  const staffProgress = progressList.filter(p => p.staffId === staff.id);
  const completedProgress = staffProgress.filter(p => p.status === 'completed');
  const completionPercentage = Math.round((completedProgress.length / topics.length) * 100);

  // Calculate Average score
  const totalScore = completedProgress.reduce((sum, current) => sum + (current.quizScore || 0), 0);
  const maxScoreSum = completedProgress.reduce((sum, current) => sum + (current.maxScore || 5), 0);
  const averageScorePercent = maxScoreSum > 0 ? Math.round((totalScore / maxScoreSum) * 100) : 0;

  const handlePrint = () => {
    const printContent = portfolioRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("กรุณาเปิดสิทธิ์การใช้งาน Pop-up เพื่อสั่งพิมพ์รายงาน Portfolio");
      return;
    }

    const todayTh = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>แฟ้มผลงานอบรมรังสีวิทยา - ${staff.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { 
              margin: 0; 
              padding: 40px; 
              font-family: 'Sarabun', sans-serif;
              background-color: #ffffff;
              color: #1a1a1a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-container {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .print-header {
              display: flex;
              align-items: center;
              gap: 20px;
              border-bottom: 3px solid #1a1a1a;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .print-logo {
              width: 75px;
              height: 75px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .print-title-area h1 {
              font-size: 22px;
              font-weight: 800;
              margin: 0 0 5px 0;
              color: #1e3a8a;
            }
            .print-title-area p {
              font-size: 13px;
              color: #4b5563;
              margin: 0;
            }
            .profile-grid {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-box {
              border: 1px solid #1a1a1a;
              padding: 15px;
              background-color: #f9fafb;
            }
            .info-box h3 {
              margin: 0 0 10px 0;
              font-size: 14px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              text-transform: uppercase;
            }
            .info-item {
              font-size: 13px;
              margin-bottom: 6px;
            }
            .info-item strong {
              color: #0f172a;
            }
            .stats-row {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              border: 1px solid #e5e7eb;
              padding: 15px;
              text-align: center;
              background: #fcfcfd;
            }
            .stat-num {
              font-size: 24px;
              font-weight: 800;
              margin-bottom: 5px;
            }
            .stat-lbl {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              margin-bottom: 40px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 10px 12px;
              font-size: 12px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 700;
              text-align: left;
            }
            .text-center { text-align: center; }
            .badge-complete {
              background-color: #d1fae5;
              color: #065f46;
              font-weight: bold;
              padding: 2px 6px;
              font-size: 11px;
            }
            .badge-pending {
              background-color: #f3f4f6;
              color: #6b7280;
              padding: 2px 6px;
              font-size: 11px;
            }
            .sig-area {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              padding-top: 30px;
              border-top: 1px dashed #cbd5e1;
            }
            .sig-block {
              width: 250px;
              text-align: center;
              font-size: 12px;
            }
            .sig-line {
              border-bottom: 1px solid #1a1a1a;
              height: 45px;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .sig-image {
              max-height: 40px;
              max-width: 150px;
              object-fit: contain;
            }
            .footer-info {
              margin-top: 40px;
              font-size: 10px;
              color: #9ca3af;
              text-align: center;
            }
            @media print {
              body { padding: 20px; }
              @page { size: portrait; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getTopicProgress = (topicId: string) => {
    return staffProgress.find(p => p.topicId === topicId);
  };

  return (
    <div className="space-y-6 w-full no-print">
      
      {/* Upper toolbar controls */}
      <div className="flex border border-black p-4 bg-cream items-center justify-between sm:flex-row flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#1A1A1A] p-2 text-cream border border-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">แฟ้มสะสมงานฝึกอบรม (Individual Portfolio)</h4>
            <p className="text-xs text-slate-500 font-serif">สถิติคะแนน ใบความรู้ และลายเซ็นรับรองผลการพิจารณาตนเองแบบบูรณาการ</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-2 hover:bg-black bg-[#1A1A1A] text-white font-extrabold text-xs uppercase tracking-wider rounded-none border border-black transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          สั่งพิมพ์เล่ม Portfolio ผลงานA4
        </button>
      </div>

      {/* Screen Preview & Container to print */}
      <div className="bg-[#F3F2F0] border-2 border-black p-6 md:p-10 font-sans shadow-inner overflow-hidden flex justify-center">
        <div className="bg-white border-4 border-double border-[#1A1A1A] p-8 max-w-[850px] w-full text-slate-900 shadow-md">
          
          {/* Printable Area Wrapper */}
          <div ref={portfolioRef} className="w-full">
            
            {/* 1. Official Header */}
            <div className="print-header flex items-center gap-4 border-b-4 border-double border-black pb-4 mb-6">
              <div className="w-16 h-16 shrink-0 print-logo flex items-center justify-center">
                <MaethaLogo size={60} />
              </div>
              <div className="print-title-area flex-1">
                <h1 className="text-xl md:text-2xl font-serif font-black text-blue-900 tracking-tight">แฟ้มผลการเรียนรู้เเละประเมินสมรรถนะเทคนิคส่วนบุคคล</h1>
                <p className="text-xs text-slate-600 font-serif">กลุ่มงานรังสีวิทยาและการพยาบาล โรงพยาบาลแม่ทา อำเภอแม่ทา จังหวัดลำพูน</p>
              </div>
            </div>

            {/* 2. Profile Details Grid */}
            <div className="profile-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 info-box border border-black p-4 bg-slate-50/50 rounded-none flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 pb-1.5 mb-2.5">
                    ประวัติบุคลากรผู้ฝึกอบรม (STAFF PROFILE)
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-serif">
                    <div className="info-item">ชื่อ-นามสกุล: <strong className="font-extrabold">{staff.name}</strong></div>
                    <div className="info-item">เลขพนักงานประจำตัว: <strong className="font-mono">{staff.id.substring(0, 8).toUpperCase()}</strong></div>
                    <div className="info-item">ตำแหน่งงาน: <strong className="font-extrabold">{staff.position}</strong></div>
                    <div className="info-item">ฝ่ายงาน/สังกัดแผนก: <strong className="font-extrabold">{staff.department}</strong></div>
                    <div className="info-item">วันที่ลงทะเบียนระบบ: <span>{new Date(staff.registeredAt).toLocaleDateString('th-TH')}</span></div>
                    <div className="info-item">สถานะการคุมวินิจฉัย: <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 border border-emerald-300 py-0.2 select-none text-[10px]">ACTIVE & COMPLIANT</span></div>
                  </div>
                </div>
              </div>

              {/* Quick stats panel */}
              <div className="info-box border border-black p-4 bg-slate-50/50 rounded-none flex flex-col justify-between text-center">
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 pb-1.5 mb-2.5 text-center">
                    ความสำเร็จรวม (SUM)
                  </h3>
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-3xl font-serif font-black text-[#1A1A1A]">{completedProgress.length} / {topics.length}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">วิชาสำเร็จสะสม (COURSES)</div>
                    </div>
                    
                    <div className="w-full h-2 bg-white border border-black rounded-none overflow-hidden">
                      <div className="h-full bg-slate-800" style={{ width: `${completionPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Core KPIs Dashboard box */}
            <div className="stats-row grid grid-cols-3 gap-4 mb-6">
              <div className="stat-card border border-slate-200 bg-slate-50/20 p-3 text-center flex flex-col justify-center items-center">
                <span className="text-2xl font-serif font-black text-rose-800">{averageScorePercent}%</span>
                <span className="text-[9px] text-slate-500 font-mono tracking-widest stat-lbl">อัตราสอบผ่าน (AVERAGE SCORE)</span>
              </div>
              <div className="stat-card border border-slate-200 bg-slate-50/20 p-3 text-center flex flex-col justify-center items-center">
                <span className="text-2xl font-serif font-black text-emerald-800">{completedProgress.length} คอร์ส</span>
                <span className="text-[9px] text-slate-500 font-mono tracking-widest stat-lbl">ระดับผ่านความรู้ (MASTERY CHECKOUT)</span>
              </div>
              <div className="stat-card border border-slate-200 bg-slate-50/20 p-3 text-center flex flex-col justify-center items-center">
                <span className="text-2xl font-serif font-black text-blue-800">{staffProgress.filter(p => p.status === 'studying').length} คอร์ส</span>
                <span className="text-[9px] text-slate-500 font-mono tracking-widest stat-lbl">กำลังเข้าศึกษา (IN PROGRESS)</span>
              </div>
            </div>

            {/* 5. Course Record Table */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 pb-1.5 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-[#1A1A1A]" />
                ตารางบันทึกผลการประเมินและการฝึกอบรมตามหลักสูตรรพ.แม่ทา (METHA CURRICULUM LOG)
              </h3>
              
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs font-serif text-slate-700">
                  <thead>
                    <tr className="bg-slate-100 border border-slate-300">
                      <th className="px-3 py-2 text-left border">รหัสหลักสูตร</th>
                      <th className="px-3 py-2 text-left border">ชื่อวิชาเเละหัวเรื่อง</th>
                      <th className="px-3 py-2 text-center border">สถิติคอนคะแนน</th>
                      <th className="px-3 py-2 text-center border">สถานะสัมฤทธิ์</th>
                      <th className="px-3 py-2 text-center border">วันที่สำเร็จ</th>
                      <th className="px-3 py-2 text-center border">ลายชื่อเจ้าตัวผู้สอบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map(t => {
                      const prog = getTopicProgress(t.id);
                      const isComp = prog?.status === 'completed';
                      
                      return (
                        <tr key={t.id} className="border-b border-slate-200 hover:bg-slate-50/30">
                          <td className="px-3 py-2.5 font-mono text-[9px] uppercase border font-bold text-slate-700 select-all">
                            MT-RAD-{t.id.substring(0, 5).toUpperCase()}
                          </td>
                          <td className="px-3 py-2.5 border text-[11px] font-bold text-[#1A1A1A]">
                            {t.title}
                          </td>
                          <td className="px-3 py-2.5 border text-center font-mono font-extrabold text-blue-900">
                            {isComp ? `${prog.quizScore} / ${prog.maxScore || 5}` : '-'}
                          </td>
                          <td className="px-3 py-2.5 border text-center">
                            {isComp ? (
                              <span className="badge-complete text-[10px] font-mono select-none px-2 py-0.5 bg-emerald-50 text-emerald-805 border border-emerald-300">
                                PASSED
                              </span>
                            ) : (
                              <span className="badge-pending text-[10px] font-mono select-none px-2 py-0.5 bg-slate-100 text-slate-500 italic">
                                studying
                              </span>
                            )}
                          </td>
                          <td className="text-center px-3 py-2.5 border font-mono text-[10px] text-slate-500">
                            {prog?.completedAt 
                              ? new Date(prog.completedAt).toLocaleDateString('th-TH', { year: '2-digit', month: 'numeric', day: 'numeric' })
                              : '-'
                            }
                          </td>
                          <td className="px-3 py-2.5 border text-center">
                            <div className="flex items-center justify-center min-h-[25px]">
                              {prog?.staffSignature ? (
                                <img src={prog.staffSignature} alt="ลายเซ็นสตาฟ" className="max-h-[24px] max-w-[80px] object-contain shrink-0" />
                              ) : isComp ? (
                                <span className="text-[10px] text-slate-400 italic">เซ็นสดข้ามสาย</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Legal & Ethics Disclaimer Declaration block */}
            <div className="mt-8 border border-slate-300 p-4 bg-[#fcfcfd] rounded-none flex items-start gap-3 flex-row font-serif text-[11px] text-slate-700 leading-relaxed text-justify">
              <ShieldCheck className="w-10 h-10 shrink-0 text-slate-800" />
              <div>
                <p className="font-extrabold text-slate-900">หนังสือคำประกาศสัตยาบันด้านจริยธรรมผู้ปฏิบัติศาสนวิทยาศาสตร์แม่ทา (Student Declaration):</p>
                <p className="mt-1">
                  ข้าพเจ้าขอให้คำยินยอมและสัตยาบันว่า ข้าพเจ้าได้ดำเนินการเข้ารับฟังการฝึกอบรมในวิชาความรู้สกัดหลักด้านสารสนเทศ PACS, กฎหมาย PDPA แผนกรังสี, และแนวทางปฏิบัติประกันคุณภาพการทำงาน 
                  รวมถึงได้ดำเนินการฝึกซ้อมและทำแบบประเมินความรู้ทั้ง 5 ข้อในแต่ละหมวดวิชาด้วยประสิทธิภาพตนเองอย่างแท้จริง ข้าพเจ้ามีความเชี่ยวชาญ คมชัด และพร้อมนอบน้อมยึดถือระเบียบทางวิชาการและแนวมาตรฐานความปลอดภัยในการวิเคราะห์ภาพเสีย (RAD-09) เพื่อดูแลสุขภาพและความปลอดภัยสูงสุดของผู้ป่วยที่มารับบริการในโรงพยาบาลแม่ทาอย่างเป็นทางการ
                </p>
              </div>
            </div>

            {/* 7. Signatures footer for formal audits */}
            <div className="sig-area flex justify-between items-center mt-12 pt-6 border-t border-dashed border-slate-300 font-sans">
              <div className="sig-block w-[240px] text-center text-xs">
                <div className="sig-line border-b border-black h-12 flex items-center justify-center font-mono text-xs italic">
                  {completedProgress.length > 0 && completedProgress[0].staffSignature ? (
                    <img src={completedProgress[0].staffSignature} alt="ลายเซ็นอิเล็กทรอนิกส์" className="sig-image max-h-[38px]" />
                  ) : (
                    <span className="text-slate-300">[ลายเซ็นสด]</span>
                  )}
                </div>
                <p className="font-extrabold font-serif text-slate-800 mt-1.5">{staff.name}</p>
                <p className="text-[10px] text-slate-500 font-serif mt-0.5">ผู้ฝึกอบรมและประเมินผลสัมฤทธิ์</p>
              </div>

              <div className="sig-block w-[240px] text-center text-xs">
                <div className="sig-line border-b border-black h-12 flex items-center justify-center font-mono text-xs text-slate-400 italic">
                  (ลงชื่อสดเพื่อรับรอง)
                </div>
                <p className="font-extrabold font-serif text-slate-800 mt-1.5">นายสิทธิศักดิ์ เลาหกุล</p>
                <p className="text-[10px] text-slate-500 font-serif mt-0.5">หัวหน้างานพิจารณาเอกลักษณ์ระบบรพ.แม่ทา</p>
              </div>
            </div>

            {/* 8. Micro ID footer */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 mt-12 pt-4 border-t border-slate-100 font-mono">
              <span>รายงานคุมการประเมินพิมพ์สารสนเทศเมื่อ: {new Date().toLocaleDateString('th-TH')}</span>
              <span>โรงพยาบาลแม่ทา ลำพูน</span>
              <span>รหัสดิสแพทช์: MT-PORTFOLIO-{staff.id.substring(0,6).toUpperCase()}</span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
