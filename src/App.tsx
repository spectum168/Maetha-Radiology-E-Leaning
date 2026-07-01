import { useState, useEffect, FormEvent } from 'react';
import {
  BookOpen,
  Users,
  Award,
  FileBarChart2,
  CheckCircle2,
  UserPlus,
  Trash2,
  HelpCircle,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Building2,
  PlayCircle,
  FileText,
  User,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Staff, Topic, TrainingProgress, ApprovalRecord } from './types';
import { TOPICS_DATA } from './topicsData';
import { SignaturePad } from './components/SignaturePad';
import { StaffPortfolio } from './components/StaffPortfolio';
import { MaethaLogo } from './components/MaethaLogo';
import { DEFAULT_STAFF_LIST, DEFAULT_PROGRESS_LIST, DEFAULT_APPROVAL_LIST } from './defaultData';
import { db } from './lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';

export default function App() {
  // --- STATE ---
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [activeStaffId, setActiveStaffId] = useState<string>('');
  const [progressList, setProgressList] = useState<TrainingProgress[]>([]);
  const [approvalList, setApprovalList] = useState<ApprovalRecord[]>([]);
  
  // Head of Department (HOD) default settings
  const [headName, setHeadName] = useState<string>('นายสิทธิศักดิ์ เลาหกุล');
  const [headPosition, setHeadPosition] = useState<string>('หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา');
  const [headSignature, setHeadSignature] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<'classroom' | 'reports' | 'portfolio'>('classroom');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('carestream-pacs');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportCopied, setExportCopied] = useState<boolean>(false);
  
  // Form state
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffPosition, setNewStaffPosition] = useState<string>('นักรังสีการแพทย์');
  const [newStaffDept, setNewStaffDept] = useState<string>('กลุ่มงานรังสีเทคนิค');

  // Quiz active state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<string>('');
  const [tempStaffSignature, setTempStaffSignature] = useState<string>('');

  // Active user's signature input state for claiming cert
  const [isSigning, setIsSigning] = useState<boolean>(false);

  // Custom non-blocking modal system for alerts/confirms (bypasses iframe restrictions)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const triggerAlert = (title: string, message: string) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'alert'
    });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm
    });
  };

  // Initialize data from Firestore (realtime sync) with LocalStorage as a fallback/cache
  useEffect(() => {
    // 1. Settings / HOD profile sync
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global_settings'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.headName) {
          setHeadName(data.headName);
          localStorage.setItem('maetha_head_name', data.headName);
        }
        if (data.headPosition) {
          setHeadPosition(data.headPosition);
          localStorage.setItem('maetha_head_pos', data.headPosition);
        }
        if (data.headSignature !== undefined) {
          setHeadSignature(data.headSignature);
          localStorage.setItem('maetha_head_sig', data.headSignature);
        }
      } else {
        // First-time seed of HOD settings if not in DB
        const initialSettings = {
          headName: localStorage.getItem('maetha_head_name') || 'นายสิทธิศักดิ์ เลาหกุล',
          headPosition: localStorage.getItem('maetha_head_pos') || 'หัวหน้ากลุ่มงานรังสีเทคนิค โรงพยาบาลแม่ทา',
          headSignature: localStorage.getItem('maetha_head_sig') || ''
        };
        setDoc(doc(db, 'settings', 'global_settings'), initialSettings)
          .catch(err => console.error("Error setting initial settings:", err));
      }
    });

    // 2. Staff List realtime sync
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      if (snapshot.empty) {
        // Seed database from defaults or local storage
        const savedStaffStr = localStorage.getItem('maetha_staff');
        let initialStaff = DEFAULT_STAFF_LIST;
        if (savedStaffStr) {
          try {
            const parsed = JSON.parse(savedStaffStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialStaff = parsed.filter((s: any) => s && s.id !== 'staff-1' && s.id !== 'staff-2');
            }
          } catch (_) {}
        }
        
        const batch = writeBatch(db);
        initialStaff.forEach(item => {
          batch.set(doc(db, 'staff', item.id), item);
        });
        batch.commit()
          .then(() => {
            setStaffList(initialStaff);
            localStorage.setItem('maetha_staff', JSON.stringify(initialStaff));
          })
          .catch(err => console.error("Error seeding staff:", err));
      } else {
        const list: Staff[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Staff);
        });
        // Sort by registeredAt ascending
        list.sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
        setStaffList(list);
        localStorage.setItem('maetha_staff', JSON.stringify(list));

        // Sync default active staff
        if (list.length > 0) {
          setActiveStaffId(prev => {
            if (prev && list.some(s => s.id === prev)) return prev;
            const akkaradech = list.find(s => s.name === 'อัครเดช พลอยพิมพ์');
            return akkaradech ? akkaradech.id : list[0].id;
          });
        }
      }
    });

    // 3. Progress List realtime sync
    const unsubProgress = onSnapshot(collection(db, 'progress'), (snapshot) => {
      if (snapshot.empty) {
        // Seed progress from defaults or local storage
        const savedProgStr = localStorage.getItem('maetha_progress');
        let initialProg = DEFAULT_PROGRESS_LIST;
        if (savedProgStr) {
          try {
            const parsed = JSON.parse(savedProgStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialProg = parsed.filter((p: any) => p && p.staffId !== 'staff-1' && p.staffId !== 'staff-2');
            }
          } catch (_) {}
        }

        const batch = writeBatch(db);
        initialProg.forEach(item => {
          batch.set(doc(db, 'progress', `${item.staffId}_${item.topicId}`), item);
        });
        batch.commit()
          .then(() => {
            setProgressList(initialProg);
            localStorage.setItem('maetha_progress', JSON.stringify(initialProg));
          })
          .catch(err => console.error("Error seeding progress:", err));
      } else {
        const list: TrainingProgress[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as TrainingProgress);
        });
        setProgressList(list);
        localStorage.setItem('maetha_progress', JSON.stringify(list));
      }
    });

    // 4. Approval List realtime sync
    const unsubApprovals = onSnapshot(collection(db, 'approvals'), (snapshot) => {
      if (snapshot.empty) {
        // Seed approvals from defaults or local storage
        const savedAppStr = localStorage.getItem('maetha_approvals');
        let initialApp = DEFAULT_APPROVAL_LIST;
        if (savedAppStr) {
          try {
            const parsed = JSON.parse(savedAppStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialApp = parsed.filter((a: any) => a && a.staffId !== 'staff-1' && a.staffId !== 'staff-2');
            }
          } catch (_) {}
        }

        const batch = writeBatch(db);
        initialApp.forEach(item => {
          batch.set(doc(db, 'approvals', `${item.staffId}_${item.topicId}`), item);
        });
        batch.commit()
          .then(() => {
            setApprovalList(initialApp);
            localStorage.setItem('maetha_approvals', JSON.stringify(initialApp));
          })
          .catch(err => console.error("Error seeding approvals:", err));
      } else {
        const list: ApprovalRecord[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as ApprovalRecord);
        });
        setApprovalList(list);
        localStorage.setItem('maetha_approvals', JSON.stringify(list));
      }
    });

    return () => {
      unsubSettings();
      unsubStaff();
      unsubProgress();
      unsubApprovals();
    };
  }, []);

  // Save changes helper functions (keep localStorage as backup, write directly to Firestore)
  const saveStaffList = (list: Staff[]) => {
    setStaffList(list);
    localStorage.setItem('maetha_staff', JSON.stringify(list));
  };

  const saveProgressList = (list: TrainingProgress[]) => {
    setProgressList(list);
    localStorage.setItem('maetha_progress', JSON.stringify(list));
  };

  const saveApprovalList = (list: ApprovalRecord[]) => {
    setApprovalList(list);
    localStorage.setItem('maetha_approvals', JSON.stringify(list));
  };

  // --- HANDLERS ---
  
  // Create Staff
  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      name: newStaffName,
      position: newStaffPosition,
      department: newStaffDept,
      registeredAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'staff', newStaff.id), newStaff);
      setActiveStaffId(newStaff.id);
      setNewStaffName('');
      triggerAlert('ลงทะเบียนสำเร็จ', `บันทึกข้อมูลและตั้งค่าให้ คุณ ${newStaff.name} (${newStaff.position}) เป็นผู้เรียนปัจจุบันประจำระบบเรียบร้อยค่ะ`);
    } catch (err) {
      console.error('Error saving staff:', err);
      triggerAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลการลงทะเบียนได้');
    }
  };

  // Delete Staff
  const handleDeleteStaff = (id: string) => {
    triggerConfirm(
      'ยืนยันการลบข้อมูลบุคลากร',
      'คุณต้องการลบข้อมูลบุคลากรรายนี้ใช่หรือไม่? ประวัติคะแนนการประเมินและเกียรติบัตรทั้งหมดของบุคลากรรายนี้จะถูกลบออกแบบถาวร',
      async () => {
        try {
          await deleteDoc(doc(db, 'staff', id));

          // Clean related progress and approvals
          const relatedProgress = progressList.filter(p => p.staffId === id);
          for (const p of relatedProgress) {
            await deleteDoc(doc(db, 'progress', `${p.staffId}_${p.topicId}`));
          }

          const relatedApprovals = approvalList.filter(a => a.staffId === id);
          for (const a of relatedApprovals) {
            await deleteDoc(doc(db, 'approvals', `${a.staffId}_${a.topicId}`));
          }

          const remainingStaff = staffList.filter(s => s.id !== id);
          if (activeStaffId === id) {
            setActiveStaffId(remainingStaff.length > 0 ? remainingStaff[0].id : '');
          }
        } catch (err) {
          console.error('Error deleting staff:', err);
        }
      }
    );
  };

  // Delete Progress Record
  const handleDeleteProgress = (staffId: string, topicId: string) => {
    triggerConfirm(
      'ยืนยันการลบผลคะแนนการประเมิน',
      'คุณต้องการลบประวัติคำขอและผลคะแนนเรียนวิชานี้ของบุคลากรใช่หรือไม่? การอนุมัติเกียรติบัตรที่เกี่ยวเนื่องจะถูกเพิกถอนออกแบบถาวรด้วยเพื่อให้เจ้าหน้าที่สามารถทำแบบทดสอบใหม่ได้',
      async () => {
        try {
          await deleteDoc(doc(db, 'progress', `${staffId}_${topicId}`));
          await deleteDoc(doc(db, 'approvals', `${staffId}_${topicId}`));
        } catch (err) {
          console.error('Error deleting progress:', err);
        }
      }
    );
  };

  // Change staff selection
  const handleSelectStaff = (id: string) => {
    setActiveStaffId(id);
    // Reset temporary quiz answers and signatures
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizFeedback('');
    setTempStaffSignature('');
    setIsSigning(false);
  };

  // Change Topic Selection
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizFeedback('');
    setTempStaffSignature('');
    setIsSigning(false);
  };

  // Answer Quiz question
  const handleAnswerQuestion = (questionId: string, optionIdx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = (topic: Topic) => {
    // Verify all questions answered
    const unanswered = topic.questions.filter(q => quizAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      triggerAlert('กรุณาตอบคำถาม', 'กรุณาทำข้อสอบและตอบคำถามให้ครบถ้วนทุกข้อก่อนส่งผลการประเมิน');
      return;
    }

    let correctCount = 0;
    topic.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswerIdx) {
        correctCount++;
      }
    });

    const minPassCount = Math.ceil(topic.questions.length * 0.66); // 2 out of 3
    const passed = correctCount >= minPassCount;

    setQuizSubmitted(true);
    
    if (passed) {
      setQuizFeedback(`ผ่านการประเมิน! คุณทำคะแนนได้ ${correctCount}/${topic.questions.length} คะแนน ระบบอัปเดตบันทึกสถิติลงแฟ้มผลการสอบโดยอัตโนมัติแล้วค่ะ ท่านสามารถลงลายมือชื่อดิจิทัลและกด "ยืนยันและสลักลายมือชื่อ" ด้านล่างเพื่อส่งอนุมัติออกเกียรติบัตรรับรองเสร็จสิ้นสมบูรณ์ หรือย้ายประเภทตรวจสอบหน้า Portfolio ได้ทันที`);
      
      if (activeStaffId) {
        const existingIdx = progressList.findIndex(
          p => p.staffId === activeStaffId && p.topicId === topic.id
        );

        const newProgress: TrainingProgress = {
          staffId: activeStaffId,
          topicId: topic.id,
          status: 'completed',
          quizScore: correctCount,
          maxScore: topic.questions.length,
          passed: true,
          completedAt: new Date().toISOString(),
          staffSignature: tempStaffSignature || ''
        };

        const existingItem = existingIdx >= 0 ? progressList[existingIdx] : null;
        if (existingItem && !newProgress.staffSignature && existingItem.staffSignature) {
          newProgress.staffSignature = existingItem.staffSignature;
        }
        
        setDoc(doc(db, 'progress', `${activeStaffId}_${topic.id}`), newProgress)
          .catch(err => console.error("Error saving progress:", err));
      }
    } else {
      setQuizFeedback(`ไม่ผ่านเกณฑ์ขั้นต่ำสำหรับประกาศนียบัตร (ต้องการขั้นต่ำ ${minPassCount}/${topic.questions.length} คะแนน) ได้รับคะแนน: ${correctCount} คะแนน กรุณาลองทบทวนบทเรียนและทำข้อสอบใหม่อีกครั้ง`);
    }
  };

  // Submit Staff Signature & Complete Course
  const handleSaveStaffSignature = (sigDataUrl: string) => {
    setTempStaffSignature(sigDataUrl);
  };

  const handleClaimCertificate = async () => {
    if (!activeStaffId) {
      triggerAlert('เลือกผู้ใช้งาน', 'กรุณาเลือกชื่อบุคลากรผู้เรียนก่อนทำการบันทึกยืนยัน');
      return;
    }

    const currentTopic = TOPICS_DATA.find(t => t.id === selectedTopicId);
    if (!currentTopic) return;

    let correctCount = 0;
    currentTopic.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswerIdx) correctCount++;
    });

    const newProgress: TrainingProgress = {
      staffId: activeStaffId,
      topicId: selectedTopicId,
      status: 'completed',
      quizScore: correctCount,
      maxScore: currentTopic.questions.length,
      passed: true,
      completedAt: new Date().toISOString(),
      staffSignature: tempStaffSignature || ''
    };

    try {
      await setDoc(doc(db, 'progress', `${activeStaffId}_${selectedTopicId}`), newProgress);
      triggerAlert('บันทึกสำเร็จ', 'บันทึกคะแนนและลายมือชื่อของท่านลงเวชระเบียนแฟ้มผลการสอบเรียบร้อยแล้วค่ะ! ท่านสามารถตรวจสอบแฟ้มสะสมงานบุคคล (Staff Portfolio) ทันที');
      // Reset temp signature
      setTempStaffSignature('');
      // Switch to Portfolio View
      setActiveTab('portfolio');
    } catch (err) {
      console.error('Error saving progress with signature:', err);
      triggerAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลการเคลมเกียรติบัตรได้');
    }
  };

  // Set HOD profile and save
  const handleSaveHODConfig = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global_settings'), {
        headName,
        headPosition
      }, { merge: true });
      localStorage.setItem('maetha_head_name', headName);
      localStorage.setItem('maetha_head_pos', headPosition);
      triggerAlert('บันทึกสำเร็จ', 'บันทึกข้อมูลตัวตนหัวหน้ากลุ่มงานรังสีการแพทย์เสร็จเรียบร้อย');
    } catch (err) {
      console.error('Error saving HOD config:', err);
      triggerAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const handleSaveHODSignature = async (sigDataUrl: string) => {
    setHeadSignature(sigDataUrl);
    localStorage.setItem('maetha_head_sig', sigDataUrl);
    try {
      await setDoc(doc(db, 'settings', 'global_settings'), {
        headSignature: sigDataUrl
      }, { merge: true });
    } catch (err) {
      console.error('Error saving HOD signature:', err);
    }
  };

  // Approved and sign a specific staff progress index
  const handleApproveCertificate = async (staffId: string, topicId: string) => {
    if (!headSignature) {
      triggerAlert('กรุณาลงลายไม้ชื่อ', 'กรุณาจรดปากกาเซ็นระบบของหัวหน้ากลุ่มงานด้านบนก่อน เพื่อใช้ตัวตนลงลายมือชื่อพิจารณาอนุมัติเกียรติบัตร');
      return;
    }

    const newApproval: ApprovalRecord = {
      staffId,
      topicId,
      headName,
      headPosition,
      headSignature: headSignature,
      approvedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'approvals', `${staffId}_${topicId}`), newApproval);
      triggerAlert('อนุมัติเกียรติบัตรสำเร็จ', 'ระบบทำการอนุมัติผลการเรียน ออกหนังสือรับรองเกียรติบัตรออนไลน์ และลงลายเซ็นสดของหัวหน้างานเรียบร้อย');
    } catch (err) {
      console.error('Error approving certificate:', err);
      triggerAlert('เกิดข้อผิดพลาด', 'ไม่สามารถอนุมัติได้');
    }
  };

  // Reject/Delete an approval
  const handleRevokeApproval = (staffId: string, topicId: string) => {
    triggerConfirm(
      'ยืนยันการยกเลิกการลงนามอนุมัติ',
      'คุณต้องการยกเลิกการลงนามลายเซ็นรับรองเกียรติบัตรใบนี้ใช่หรือไม่?',
      async () => {
        try {
          await deleteDoc(doc(db, 'approvals', `${staffId}_${topicId}`));
        } catch (err) {
          console.error('Error revoking approval:', err);
        }
      }
    );
  };

  // Restore original default data to Firestore
  const handleRestoreDefaults = () => {
    triggerConfirm(
      'ยืนยันการคืนค่าข้อมูลดั้งเดิม',
      'คุณต้องการเขียนทับหรือคืนค่ารายชื่อเจ้าหน้าที่ทั้ง 8 ท่าน พร้อมประวัติผลการเรียนและการประเมินทั้งหมด (10 คอร์สสำเร็จ) กลับมาใส่ใหม่ด้วยข้อมูลจากระบบต้นฉบับใช่หรือไม่?',
      async () => {
        try {
          const batch = writeBatch(db);
          
          // 1. Overwrite 8 staff members
          DEFAULT_STAFF_LIST.forEach(item => {
            batch.set(doc(db, 'staff', item.id), item);
          });
          
          // 2. Overwrite 10 progress records
          DEFAULT_PROGRESS_LIST.forEach(item => {
            batch.set(doc(db, 'progress', `${item.staffId}_${item.topicId}`), item);
          });
          
          await batch.commit();
          triggerAlert('คืนค่าสำเร็จ', 'ระบบทำการดึงข้อมูลเจ้าหน้าที่เดิมทั้ง 8 ท่าน และบันทึกคะแนนสอบประเมินคืนสู่ฐานข้อมูล Firestore เรียบร้อยแล้วค่ะ!');
        } catch (err) {
          console.error('Error restoring defaults:', err);
          triggerAlert('เกิดข้อผิดพลาด', 'ไม่สามารถเขียนทับข้อมูลดั้งเดิมลงฐานข้อมูลได้สำเร็จ');
        }
      }
    );
  };

  // Get active staff metadata
  const activeStaff = staffList.find(s => s.id === activeStaffId);
  const currentTopic = TOPICS_DATA.find(t => t.id === selectedTopicId);
  const currentProgress = progressList.find(
    p => p.staffId === activeStaffId && p.topicId === selectedTopicId
  );
  const currentApproval = approvalList.find(
    a => a.staffId === activeStaffId && a.topicId === selectedTopicId
  );

  // Stats calculation
  const totalStaffCount = staffList.length;
  const countCompletedTopic = (topicId: string) => progressList.filter(p => p.topicId === topicId && p.status === 'completed').length;
  const totalCertificatesApproved = approvalList.length;
  
  // Completed courses count for current staff
  const staffCompletedCount = progressList.filter(p => p.staffId === activeStaffId && p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-cream flex flex-col antialiased font-sans">
      
      {/* HEADER SECTION */}
      <header className="bg-[#1A1A1A] text-cream border-b-4 border-double border-black shadow-none no-print">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-white p-1 rounded-none border-2 border-black flex items-center justify-center">
              <MaethaLogo size={58} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cream text-black font-extrabold text-[10px] px-2 py-0.5 rounded-none uppercase tracking-widest">MAE THA HOSPITAL</span>
                <span className="text-gray-300 text-xs font-semibold tracking-wider">กลุ่มงานรังสีเทคนิค</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
                ระบบการฝึกอบรมรังสี และประเมินของบุคลากรที่ช่วยปฏิบัติงาน
              </h1>
            </div>
          </div>

          {/* Active User Switcher */}
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-none border border-white/10">
            <div className="bg-[#2A2A2A] p-1.5 rounded-none text-gray-300">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">ชื่อบุคลากรผู้ฝึกเข้าใช้งาน</p>
              {activeStaff ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white">{activeStaff.name}</span>
                  <span className="text-xs text-amber-300">({activeStaff.position})</span>
                </div>
              ) : (
                <span className="text-xs text-rose-300 font-semibold">กรุณาเพิ่มและเลือกบุคลากร</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CORE SYSTEM METRICS */}
      <section className="bg-white border-b border-black py-3 shadow-none no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-wrap gap-5 md:gap-10 text-xs text-slate-700 justify-between items-center">
          <div className="flex items-center gap-1 font-serif">
            <span className="font-bold text-[#1A1A1A]">กลุ่มเป้าหมายโรงพยาบาลแม่ทา :</span>
            <span className="italic">ยกระดับขีดความรู้รังสีทางวิทยาการและกฎหมายภาพถ่ายทางการแพทย์</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap font-mono uppercase tracking-wider text-[11px]">
            <span className="bg-[#F3F2F0] px-2.5 py-1 border border-black flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-900" /> บุคลากรรวม: <strong>{totalStaffCount}</strong> ท่าน
            </span>
            <span className="bg-[#F3F2F0] px-2.5 py-1 border border-black flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> อบรมสำเร็จ: <strong>{progressList.filter(p => p.status === 'completed').length}</strong> คอร์ส
            </span>
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 border border-black flex items-center gap-1 cursor-pointer transition-colors font-sans font-bold text-xs"
            >
              ☁️ อัปเดตข้อมูลขึ้น GitHub
            </button>
          </div>
        </div>
      </section>

      {/* SYSTEM TABS NAVIGATION */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 mt-6 no-print">
        <div className="flex border-b-2 border-black bg-cream p-0 gap-1 overflow-x-auto">
          <button
            id="tab-classroom"
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer border-t border-r border-l ${
              activeTab === 'classroom'
                ? 'bg-[#1A1A1A] text-cream border-black translate-y-[2px]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F3F2F0] hover:text-[#1A1A1A]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            📚 คอร์สเรียนสกัด & ข้อเขียน
          </button>
          
          <button
            id="tab-portfolio"
            onClick={() => {
              if (!activeStaffId) {
                triggerAlert('กรุณาเลือกบุคลากร', 'กรุณาสร้างหรือเลือกชื่อบุคลากรผู้เรียนในแถบขวามือด้านข้างก่อนเพื่อเข้าตรวจดูแฟ้มสะสมงานบุคคล');
                return;
              }
              setActiveTab('portfolio');
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer border-t border-r border-l ${
              activeTab === 'portfolio'
                ? 'bg-[#1A1A1A] text-cream border-black translate-y-[2px]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F3F2F0]'
            }`}
          >
            <Award className="w-4 h-4" />
            📁 แฟ้มสะสมงานบุคคล (Staff Portfolio)
            {staffCompletedCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.5 font-mono font-bold">
                {staffCompletedCount}
              </span>
            )}
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer border-t border-r border-l ${
              activeTab === 'reports'
                ? 'bg-[#1A1A1A] text-cream border-black translate-y-[2px]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F3F2F0]'
            }`}
          >
            <FileBarChart2 className="w-4 h-4" />
            📊 บันทึกสถิติคุมหลักสูตร
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-start">
          
          {/* LEFT SIDEBAR: STAFF SELECTION & MANAGEMENT */}
          <section className="lg:col-span-4 bg-white p-5 editorial-card rounded-none space-y-6 no-print">
            
            {/* Staff list panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-black pb-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-700" />
                  รายชื่อเจ้าหน้าที่รังสี ({staffList.length})
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">SELECT STAFF</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {staffList.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 border border-dashed border-[#1A1A1A] rounded-none text-xs bg-editorial-gray/30">
                    ยังไม่มีรายชื่อเจ้าหน้าที่ลงทะเบียน
                  </div>
                ) : (
                  staffList.map(s => {
                    const isSelected = s.id === activeStaffId;
                    const compCount = progressList.filter(p => p.staffId === s.id && p.status === 'completed').length;
                    
                    return (
                      <div
                        id={`staff-item-${s.id}`}
                        key={s.id}
                        onClick={() => handleSelectStaff(s.id)}
                        className={`group p-3 rounded-none border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-editorial-gray border-black shadow-none border-l-4 font-bold' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">{s.name}</p>
                          <p className="text-[10px] text-slate-500 max-w-[190px] truncate">{s.position}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 border font-mono font-bold ${
                            compCount === TOPICS_DATA.length 
                              ? 'bg-emerald-150 border-emerald-500 text-emerald-900' 
                              : compCount > 0 
                                ? 'bg-amber-100 border-amber-300 text-amber-900' 
                                : 'bg-slate-50 border-slate-300 text-slate-700'
                          }`}>
                            {compCount}/{TOPICS_DATA.length}
                          </span>
                          <button
                            id={`del-staff-${s.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStaff(s.id);
                            }}
                            className="bg-white text-rose-600 hover:bg-rose-50 p-1.5 rounded-none border border-rose-200 hover:border-rose-400 transition-colors cursor-pointer"
                            title="ลบข้อมูลเจ้าหน้าที่"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add New Staff Interface */}
            <div className="border-t border-black pt-4 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5 text-slate-800" />
                ลงทะเบียนเจ้าหน้าที่รายใหม่
              </h4>
              <form onSubmit={handleAddStaff} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">ชื่อ - นามสกุล *</label>
                  <input
                    id="input-staff-name"
                    type="text"
                    required
                    placeholder="เช่น นายอรรถพล โกศลสกุล"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-black rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">ตำแหน่งงาน</label>
                    <select
                      id="select-staff-position"
                      value={newStaffPosition}
                      onChange={(e) => setNewStaffPosition(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-black rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="นักรังสีการแพทย์ชำนาญการ">นักรังสีแพทย์</option>
                      <option value="นักรังสีการแพทย์">นักรังสีการแพทย์</option>
                      <option value="เจ้าพนักงานรังสีการแพทย์">เจ้าพนักงานรังสี</option>
                      <option value="ผู้ช่วยรังสีเทคนิค">ผู้ช่วยรังสี</option>
                      <option value="ผู้ช่วยเหลือคนไข้">ผู้ช่วยเหลือคนไข้</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">สังกัดแผนก</label>
                    <select
                      id="select-staff-dept"
                      value={newStaffDept}
                      onChange={(e) => setNewStaffDept(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-black rounded-none bg-white focus:outline-none focus:ring-1 focus:ring-black font-sans"
                    >
                      <option value="กลุ่มงานรังสีเทคนิค">กลุ่มงานรังสีเทคนิค</option>
                      <option value="กลุ่มการพยาบาล">กลุ่มการพยาบาล</option>
                    </select>
                  </div>
                </div>

                <button
                  id="submit-staff-btn"
                  type="submit"
                  className="w-full py-2 px-3 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-none border border-black shadow-sm transition-colors cursor-pointer"
                >
                  ลงทะเบียนเพิ่มบุคลากร
                </button>
              </form>
            </div>

            {/* Topic List (Course Curriculum) */}
            <div className="border-t border-black pt-4 space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-800" />
                หัวข้อวิชาอบรม ({TOPICS_DATA.length} หลักสูตร)
              </h3>
              <div className="space-y-1.5">
                {TOPICS_DATA.map((t, idx) => {
                  const isSelected = t.id === selectedTopicId;
                  const stat = progressList.find(p => p.staffId === activeStaffId && p.topicId === t.id);
                  const inCompl = stat?.status === 'completed';
                  
                  return (
                    <button
                      id={`course-item-${t.id}`}
                      key={t.id}
                      onClick={() => handleSelectTopic(t.id)}
                      className={`w-full text-left p-2.5 rounded-none border text-xs flex gap-2 items-start transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A1A1A] text-cream border-black font-bold'
                          : 'bg-white border-slate-200 hover:bg-[#F3F2F0] text-slate-700'
                      }`}
                    >
                      <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 border ${
                        isSelected
                          ? 'bg-cream text-black border-black'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-0.5">
                        <p className="leading-snug">{t.title}</p>
                        <div className="flex items-center gap-1 text-[10px]">
                          {inCompl ? (
                            <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-emerald-700 font-bold'}>
                              ✓ ผ่านอบรมสำเร็จ
                            </span>
                          ) : (
                            <span className={isSelected ? 'text-gray-400' : 'text-slate-400'}>ยังไม่มีผลเรียน</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </section>

          {/* RIGHT MAIN CONTENT SECTION */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* TAB 1: E-CLASSROOM */}
            {activeTab === 'classroom' && currentTopic && (
              <div className="bg-white p-6 editorial-card rounded-none space-y-6">
                
                {/* Course Details Intro */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-black pb-4">
                    <div className="space-y-1">
                      <span className="bg-[#1A1A1A] text-cream font-mono font-bold text-[10px] px-2.5 py-0.5 border border-black">ONLINE CURRIGULUM</span>
                      <h2 className="text-lg md:text-2xl font-serif font-bold text-[#1A1A1A] tracking-tight">{currentTopic.title}</h2>
                    </div>
                    {currentProgress?.status === 'completed' && (
                      <span className="bg-emerald-50 text-emerald-950 border border-emerald-600 font-extrabold text-xs px-3 py-1 rounded-none flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" /> STUDY COMPLETED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-serif uppercase tracking-normal">{currentTopic.description}</p>
                </div>

                {/* STUDY MATERIAL HUB (YOUTUBE EMBED OR DRIVE LINKS) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <PlayCircle className="w-4 h-4 text-[#1A1A1A]" />
                    เนื้อหาและสื่อการสอนระบบรังสี
                  </h3>

                  {/* YouTube Live embeds for supported topics */}
                  {currentTopic.embedUrl && (currentTopic.id === 'carestream-pacs' || currentTopic.id === 'pdpa-radiology') ? (
                    <div className="aspect-video w-full rounded-none overflow-hidden bg-slate-100 border border-black shadow-none">
                      <iframe
                        className="w-full h-full"
                        src={currentTopic.embedUrl}
                        title={currentTopic.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="bg-[#F3F2F0] p-5 rounded-none border border-black flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center md:text-left">
                        <h4 className="font-extrabold text-[#1A1A1A] text-sm uppercase font-serif">คอร์สเรียนสกัดองค์ความรู้ฉบับเต็ม</h4>
                        <p className="text-xs text-slate-600 font-serif">เอกสารคู่มือจัดทำขึ้นโดยทีมผู้เชี่ยวชาญรังสีวิทยาและหน่วยงานแม่ทา</p>
                      </div>
                      <a
                        href={currentTopic.url}
                        target="_blank"
                        rel="referrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-none border border-black shadow-none transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        เปิดศึกษาบทเรียนนี้ในแท็บใหม่
                      </a>
                    </div>
                  )}

                  {/* Other topics links warning */}
                  {!(currentTopic.embedUrl && (currentTopic.id === 'carestream-pacs' || currentTopic.id === 'pdpa-radiology')) && (
                    <div className="p-3 bg-amber-50 rounded-none border border-amber-300 flex items-start gap-2 text-xs text-amber-900 font-serif">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span>เนื่องจากลิงก์สําหรับชั้นเรียนนี้เป็นเอกสารใน Drive/NotebookLM ระบบจึงเปิดลิงก์แยกเป็นหน้าแท็บใหม่ได้อย่างปลอดภัยเพื่อความชัดเจนสูงสุดของคุณ</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE COMPREHENSION QUIZ */}
                <div className="border-t border-black pt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-black pb-1.5">
                    <h3 className="text-xs font-extrabold text-[#1A1A1A] flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <FileText className="w-4 h-4 text-[#1A1A1A]" />
                      แบบประเมินความรู้ประจำหลักสูตร
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">PASS RATIO: {'>'}= 2/3 CORRECT</span>
                  </div>

                  {/* Quiz status */}
                  <div className="space-y-6">
                    {currentTopic.questions.map((q, idx) => {
                      const selectedOpt = quizAnswers[q.id];
                      
                      return (
                        <div key={q.id} className="p-4 bg-cream rounded-none border border-slate-300 space-y-3">
                          <p className="text-xs font-bold text-[#1A1A1A] font-serif">
                            ข้อที่ {idx + 1}: {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((option, oIdx) => {
                              const isChecked = selectedOpt === oIdx;
                              const isCorrect = q.correctAnswerIdx === oIdx;
                              
                              let optionStyle = 'border-slate-300 bg-white hover:bg-[#F3F2F0] text-slate-800';
                              if (quizSubmitted) {
                                if (isCorrect) {
                                  optionStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold';
                                } else if (isChecked) {
                                  optionStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                                } else {
                                  optionStyle = 'border-slate-200 bg-white text-slate-400 opacity-50';
                                }
                              } else if (isChecked) {
                                optionStyle = 'border-black bg-editorial-gray text-black font-extrabold shadow-sm';
                              }
 
                              return (
                                <button
                                  id={`quiz-${q.id}-opt-${oIdx}`}
                                  key={oIdx}
                                  type="button"
                                  disabled={quizSubmitted}
                                  onClick={() => handleAnswerQuestion(q.id, oIdx)}
                                  className={`p-3 rounded-none border text-xs text-left leading-normal transition-all cursor-pointer ${optionStyle}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          {/* Individual Question explanation */}
                          {quizSubmitted && (
                            <div className="text-[11px] text-slate-500 p-2.5 bg-white border border-slate-300 rounded-none flex items-start gap-1.5 font-serif">
                              <span className="font-bold text-[#1A1A1A] shrink-0 uppercase tracking-wider text-[9px] font-mono">อรรถาธิบาย:</span>
                              <span>{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions & Feedback */}
                  <div className="space-y-3 pt-4 border-t border-black">
                    {quizFeedback && (
                      <div className={`p-4 rounded-none border flex items-start gap-2 text-xs font-serif ${
                        quizFeedback.startsWith('ผ่าน') 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
                          : 'bg-rose-50 border-rose-500 text-rose-900'
                      }`}>
                        <span className="font-bold">ผลสอบ:</span>
                        <span>{quizFeedback}</span>
                      </div>
                    )}

                    <div className="flex gap-2 font-mono">
                      {!quizSubmitted ? (
                        <button
                          id="submit-quiz-btn"
                          onClick={() => handleSubmitQuiz(currentTopic)}
                          className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-none border border-black shadow-none transition-colors cursor-pointer"
                        >
                          ส่งประเมินผลคำตอบ
                        </button>
                      ) : (
                        <button
                          id="retry-quiz-btn"
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                            setQuizFeedback('');
                            setTempStaffSignature('');
                            setIsSigning(false);
                          }}
                          className="px-6 py-2.5 bg-white hover:bg-[#F3F2F0] text-black font-extrabold text-xs uppercase tracking-wider rounded-none border border-black shadow-none transition-colors cursor-pointer"
                        >
                          ทำแบบประเมินอีกครั้ง
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* CLAIM AREA (Show ONLY when passed & submitted) */}
                {quizSubmitted && quizFeedback.startsWith('ผ่าน') && (
                  <div className="border border-black p-5 rounded-none bg-[#F3F2F0] space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1 uppercase tracking-wider font-mono">
                        <ShieldCheck className="w-4 h-4 text-emerald-800" />
                        สองขั้นตอนสุดท้าย: เซ็นชื่อและกดยืนยันบันทึกผลสำเร็จ
                      </h4>
                      <p className="text-[11px] text-slate-700 leading-normal font-serif text-justify border-b border-black/10 pb-2">
                        คุณประเมินความรู้ผ่านเรียบร้อยแล้ว กรุณาวาดลายมือชื่อดิจิทัลด้านล่าง และสลับกดยืนยันเพื่อบันทึกสถิติคุณวุฒิลงในแฟ้มสะสมผลงาน (Staff Portfolio) ยืนยันวิชาชีพอย่างสมบูรณ์ค่ะ
                      </p>
                    </div>

                    <div className="max-w-sm space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-widest font-mono">
                        ลายมือชื่อผู้ตรวจประเมินตนเอง (Staff Signature)
                      </label>
                      <SignaturePad 
                        onSave={handleSaveStaffSignature}
                        onClear={() => setTempStaffSignature('')}
                        placeholder="ลากนิ้วหรือเมาส์เพื่อจดชื่อของท่านประจำระบบ"
                      />
                      {tempStaffSignature && (
                        <div className="p-2 bg-emerald-50 border border-emerald-500 text-emerald-950 text-[10px] font-serif flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 font-bold" />
                          <span>ลงชื่อสำเร็จแล้ว! พร้อมกดยืนยันปุ่มด่านล่างได้ทันที</span>
                        </div>
                      )}
                    </div>

                    <div className="max-w-md pt-2">
                      <button
                        id="claim-certificate-btn"
                        onClick={handleClaimCertificate}
                        className="w-full py-2.5 px-4 font-extrabold text-xs uppercase tracking-wider rounded-none border border-black transition-all cursor-pointer bg-amber-400 hover:bg-amber-500 text-black shadow-sm"
                      >
                        ยืนยันความรู้เซ็นชื่อและบันทึกผลลง Portfolio 
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: STAFF PORTFOLIO VIEW */}
            {activeTab === 'portfolio' && activeStaff && (
              <StaffPortfolio
                staff={activeStaff}
                topics={TOPICS_DATA}
                progressList={progressList}
              />
            )}

            {/* TAB 4: GENERAL REPORTS */}
            {activeTab === 'reports' && (
              <div className="bg-white p-6 editorial-card rounded-none space-y-6">
                
                {/* Intro Title */}
                <div className="space-y-1 border-b-2 border-black pb-4">
                  <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
                    <FileBarChart2 className="w-5 h-5 text-slate-800" />
                    รายงานสรุปผลการประเมินและการเข้าศึกษา (Dashboard)
                  </h2>
                  <p className="text-xs text-slate-500 uppercase font-mono tracking-widest text-[9px]">
                    STATISTIC REPORTS & AUDITING SYSTEM METRICS
                  </p>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F3F2F0] border border-black p-5 rounded-none space-y-1">
                    <p className="text-slate-600 text-[10px] font-extrabold uppercase tracking-wider font-mono">จำนวนเจ้าหน้าที่ทั้งหมด</p>
                    <p className="text-3xl font-serif font-extrabold text-[#1A1A1A] leading-none">{totalStaffCount} ท่าน</p>
                    <p className="text-[10px] text-slate-500 font-serif">ลงทะเบียนในหน่วยงานรังสีเทคนิคแม่ทา</p>
                  </div>
                  <div className="bg-[#F3F2F0] border border-black p-5 rounded-none space-y-1">
                    <p className="text-slate-600 text-[10px] font-extrabold uppercase tracking-wider font-mono">คอร์สเรียนสำเร็จสะสม</p>
                    <p className="text-3xl font-serif font-extrabold text-[#1A1A1A] leading-none">
                      {progressList.filter(p => p.status === 'completed').length} ครั้ง
                    </p>
                    <p className="text-[10px] text-slate-500 font-serif">จากวิชาบทเรียนรังสีวิทยา {TOPICS_DATA.length} หลักสูตร</p>
                  </div>
                  <div className="bg-[#F3F2F0] border border-black p-5 rounded-none space-y-1">
                    <p className="text-slate-600 text-[10px] font-extrabold uppercase tracking-wider font-mono">ความสำเร็จเฉลี่ยของหน่วยงาน</p>
                    <p className="text-3xl font-serif font-extrabold text-blue-900 leading-none">
                      {totalStaffCount > 0 
                        ? Math.round((progressList.filter(p => p.status === 'completed').length / (totalStaffCount * TOPICS_DATA.length)) * 100) 
                        : 0}%
                    </p>
                    <p className="text-[10px] text-slate-500 font-serif">สัดส่วนเจ้าหน้าที่ผ่านครบเกณฑ์เฉลี่ย</p>
                  </div>
                </div>

                {/* Progress by Subjects chart simulation */}
                <div className="bg-white p-5 rounded-none border border-black space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                    สถิติปริมาณผู้ผ่านอบรมจำแนกเป็นรายวิชาหลักสูตร
                  </h3>
                  
                  <div className="space-y-3.5 font-serif">
                    {TOPICS_DATA.map((t) => {
                      const completedCount = countCompletedTopic(t.id);
                      const percent = totalStaffCount > 0 ? (completedCount / totalStaffCount) * 100 : 0;
                      
                      return (
                        <div key={t.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-800 font-bold">{t.title}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{completedCount} / {totalStaffCount} ท่าน ({Math.round(percent)}%)</span>
                          </div>
                          <div className="w-full h-3 bg-white border border-black rounded-none overflow-hidden">
                            <div 
                              className="h-full bg-[#1A1A1A] transition-all" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detail Matrix Checklist Report ready for Print/Download */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-1.5 gap-2">
                    <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                      ตารางสรุปแบบประเมินรายบุคคล (Hospital Audit Matrix)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRestoreDefaults}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-none border border-black transition-colors cursor-pointer"
                      >
                        🔄 คืนค่าข้อมูลเจ้าหน้าที่และคะแนนเดิม
                      </button>
                      <button
                        id="print-audit-btn"
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-[10px] uppercase tracking-wider rounded-none border border-black transition-colors cursor-pointer"
                      >
                        พิมพ์รายงานสารสนเทศ (Print Audit)
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-none border border-black shadow-none">
                    <table className="w-full text-xs text-left text-slate-700 border-collapse">
                      <thead className="bg-[#F3F2F0] border-b border-black text-black font-extrabold uppercase tracking-wider text-[10px] select-none">
                        <tr>
                          <th className="px-3 py-2.5 border-r border-[#1A1A1A]">รายชื่อเจ้าหน้าที่</th>
                          {TOPICS_DATA.map((t, idx) => (
                            <th key={t.id} className="px-2 py-2.5 text-center min-w-[100px] border-r border-slate-300" title={t.title}>
                              วิชา {idx + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {staffList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-slate-400">
                              ยังไม่มีสารสนเทศรายชื่อเจ้าหน้าที่
                            </td>
                          </tr>
                        ) : (
                          staffList.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="px-3 py-3 border-r border-slate-300 font-serif">
                                <span className="font-extrabold text-[#1A1A1A]">{s.name}</span>
                                <span className="block text-[10px] text-slate-500">{s.position}</span>
                              </td>
                              {TOPICS_DATA.map(t => {
                                const prog = progressList.find(p => p.staffId === s.id && p.topicId === t.id);
                                const isApproved = approvalList.some(a => a.staffId === s.id && a.topicId === t.id);
                                
                                return (
                                  <td key={t.id} className="px-2 py-3 text-center border-r border-slate-200">
                                    {prog?.status === 'completed' ? (
                                      <div className="flex flex-col items-center gap-1 justify-center font-mono">
                                        <span className="text-emerald-900 font-bold bg-emerald-50 text-[9px] px-1.5 py-0.5 border border-emerald-400">
                                          {prog.quizScore}/{prog.maxScore || 3}
                                        </span>
                                        {prog.staffSignature && (
                                          <span className="text-blue-900 font-bold text-[8px] bg-blue-50 px-1 border border-blue-300">
                                            SIGNED
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-xs">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-[#F3F2F0] border border-black rounded-none text-[11px] text-slate-700 space-y-1 font-serif">
                    <p className="font-bold">หมายเหตุการเรียนรู้หลักสูตรรังสีวิทยาโรงพยาบาลแม่ทา:</p>
                    <ul className="list-decimal pl-5 space-y-0.5">
                      <li>วิชา 1: การใช้ระบบสารสนเทศ Carestream Image Suite/PACS</li>
                      <li>วิชา 2: กฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA)</li>
                      <li>วิชา 3: การควบคุมคุณภาพประจำวัน (Daily QA)</li>
                      <li>วิชา 4: การวิเคราะห์ภาพเสีย (Reject Analysis)</li>
                      <li>วิชา 5: เทคนิคการวาง Marker ป้องกันสลับฝั่ง</li>
                      <li>วิชา 6: การจัดท่าผู้ป่วยและเคลื่อนย้ายคนไข้อย่างปลอดภัย</li>
                    </ul>
                  </div>

                </div>

              </div>
            )}

          </section>

        </div>
      </main>

      {/* SYSTEM PRINT SECTION: Hidden in browser viewport, styled for gorgeous standard landscap print reporting */}
      <section className="hidden print:block p-12 bg-white text-slate-900 w-full min-h-screen">
        <div className="space-y-6 text-center">
          <h1 className="text-2xl font-bold font-sans">รายงานผลสรุปสารสนเทศฝึกอบรมและการสอบประเมิน</h1>
          <h2 className="text-md text-slate-600">หน่วยหน่วยงานรังสีเทคนิค โรงพยาบาลแม่ทา อำเภอแม่ทา จังหวัดลำพูน</h2>
          
          <table className="w-full text-xs mt-8 border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-150">
                <th className="border border-slate-400 px-3 py-2 text-left">ชื่อ-นามสกุล บุคลากร</th>
                <th className="border border-slate-400 px-3 py-2">ตำแหน่งงาน</th>
                <th className="border border-slate-400 px-3 py-2">หัวข้อวิชาที่สอบผ่านสำเร็จ (จาก 6 วิชา)</th>
                <th className="border border-slate-400 px-3 py-2">สัดส่วนร้อยละสำเร็จ</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(s => {
                const completed = progressList.filter(p => p.staffId === s.id && p.status === 'completed');
                return (
                  <tr key={s.id}>
                    <td className="border border-slate-450 px-3 py-2 text-left font-bold">{s.name}</td>
                    <td className="border border-slate-450 px-3 py-2 text-center">{s.position}</td>
                    <td className="border border-slate-450 px-3 py-2 text-center">
                      {completed.length > 0 
                        ? completed.map(c => {
                            const t = TOPICS_DATA.find(x => x.id === c.topicId);
                            return t?.title.substring(0, 30) + "...";
                          }).join(", ")
                        : 'ยังไม่ผ่านวิชาใดเลย'}
                    </td>
                    <td className="border border-slate-450 px-3 py-2 text-center font-bold">
                      {Math.round((completed.length / 6) * 100)} %
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pt-20 grid grid-cols-2 text-center">
            <div>
              <p>ลงชื่อ ................................................................ ผู้ตรวจรายงาน</p>
              <p className="mt-2 text-xs">({headName})</p>
              <p className="text-[11px] text-slate-500">{headPosition}</p>
            </div>
            <div>
              <p>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
              <p className="text-[10px] text-slate-400 mt-2">พิมพ์โดย: ระบบอนุมัติและเกียรติบัตรออนไลน์โรงพยาบาลแม่ทา</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-center py-6 mt-auto border-t border-slate-800 text-xs leading-relaxed no-print">
        <p className="font-semibold text-slate-300">© 2026 กลุ่มงานรังสีการแพทย์และเทคนิคภาพฉายรังสี โรงพยาบาลแม่ทา จังหวัดลำพูน</p>
        <p className="text-slate-500 mt-1">ระบบพัฒนาขึ้นบนมาตรฐานความเร็ว ประสิทธิภาพคุมสิทธิความลับผู้ป่วย และมาตรฐานทางวิชาชีพบริการสาธารณสุข</p>
      </footer>

      {/* CUSTOM DIALOG MODAL (Saves from native alert/confirm iframe blockage) */}
      {modalConfig?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-none flex flex-col space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-black pb-2">
              <span className="w-2.5 h-2.5 bg-[#E21E26] shrink-0" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1A1A1A] font-sans">
                {modalConfig.title || "ระบบแจ้งเตือนหลัก"}
              </h3>
            </div>
            
            <p className="text-xs text-slate-705 leading-relaxed font-serif text-justify whitespace-pre-line font-medium text-slate-800">
              {modalConfig.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
              {modalConfig.type === 'confirm' && (
                <button
                  onClick={() => {
                    setModalConfig(null);
                    if (modalConfig.onCancel) modalConfig.onCancel();
                  }}
                  className="px-4 py-1.5 border border-black hover:bg-[#F3F2F0] text-xs font-bold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
              )}
              <button
                onClick={() => {
                  const onConfirm = modalConfig.onConfirm;
                  setModalConfig(null);
                  if (onConfirm) onConfirm();
                }}
                className="px-5 py-1.5 bg-amber-400 hover:bg-amber-500 text-black border border-black text-xs font-bold cursor-pointer transition-colors"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT BACKUP DIALOG MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-white border-2 border-black max-w-2xl w-full p-6 shadow-none flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-black pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-indigo-600 shrink-0" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1A1A1A] font-sans">
                  เครื่องมือส่งออกข้อมูลสู่ GitHub
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowExportModal(false);
                  setExportCopied(false);
                }}
                className="text-gray-500 hover:text-black font-extrabold text-sm p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-2">
              <p className="font-extrabold text-indigo-900 text-sm">
                📌 ย้ายข้อมูลจาก Local Browser เข้าสู่ Code ของคุณอย่างสมบูรณ์แบบ!
              </p>
              <p>
                เนื่องจากระบบจัดเก็บข้อมูลไว้ใน <b>LocalStorage ของเบราว์เซอร์คุณโดยเฉพาะ</b> เมื่อคุณส่งขึ้น GitHub Pages ข้อมูลรายชื่อและรูปเล่มที่ทำเสร็จแล้วอาจจะไม่แสดงผลหรือรีเซ็ตกลับเป็นค่าเริ่มต้น
              </p>
              <div className="bg-indigo-50 p-3 text-indigo-950 border-l-4 border-indigo-500 text-xs rounded-none space-y-1">
                <p className="font-bold">วิธีส่งข้อมูล 6 คนและผลงานอบรมไปอัปเดตถาวรลง GitHub:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>คลิกปุ่ม <b>"📋 คัดลอกรหัส JSON สำหรับส่ง AI"</b> ข้างล่าง</li>
                  <li>นำข้อมูลที่คัดลอกได้ <b>วางส่งมาในช่องแชท (Ask Gemini) ทางซ้ายมือนี้</b></li>
                  <li>พิมพ์แจ้ง AI เพิ่มเติมว่า: <span className="text-indigo-700 font-bold">"นี่คือข้อมูลพนักงาน 6 คนและผลงานทั้งหมด ช่วยอัปเดตใส่เป็นค่าเริ่มต้นในระบบแล้วนำส่งขึ้น GitHub ให้ด้วย"</span></li>
                  <li>AI จะบันทึกรายชื่อและผลงานทั้งหมดลงไปในโค้ดถาวรของเว็บบน GitHub เพื่อให้เมื่อทุกคนเปิดเว็บสามารถประเมินและดูผลงานจริงได้เลย!</li>
                </ol>
              </div>
            </div>

            <textarea
              readOnly
              rows={6}
              className="w-full p-2 border border-black font-mono text-[9px] bg-slate-50 focus:outline-none"
              value={JSON.stringify({
                staffList,
                progressList,
                approvalList,
                headName,
                headPosition,
                headSignature
              })}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportCopied(false);
                }}
                className="px-4 py-1.5 border border-black hover:bg-[#F3F2F0] text-xs font-bold cursor-pointer transition-colors"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify({
                    staffList,
                    progressList,
                    approvalList,
                    headName,
                    headPosition,
                    headSignature
                  });
                  navigator.clipboard.writeText(dataStr);
                  setExportCopied(true);
                }}
                className="px-5 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white bg-emerald-600 border border-black text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {exportCopied ? '✓ คัดลอกสำเร็จแล้ว!' : '📋 คัดลอกรหัส JSON สำหรับส่ง AI'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
