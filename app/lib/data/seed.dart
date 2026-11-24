import 'models.dart';

/// Sample records used until the app is connected to the Verdant backend.
abstract final class Seed {
  static const crops = [
    Crop('tomatoes', 'Tomatoes', 'TOM'),
    Crop('pepper', 'Pepper', 'PEP', marketLow: 11, marketHigh: 13),
    Crop('okra', 'Okra', 'OKR', crateKg: 20, marketLow: 7, marketHigh: 9),
    Crop('garden-eggs', 'Garden eggs', 'GEG', crateKg: 20, marketLow: 6, marketHigh: 8),
    Crop('onions', 'Onions', 'ONI', crateKg: 50, marketLow: 8, marketHigh: 10),
    Crop('maize', 'Maize', 'MAI', crateKg: 50, marketLow: 4, marketHigh: 5),
    Crop('yam', 'Yam', 'YAM', crateKg: 50, marketLow: 5, marketHigh: 7),
    Crop('kontomire', 'Kontomire', 'KON', crateKg: 10, marketLow: 5, marketHigh: 6),
  ];
  static Crop crop(String id) => crops.firstWhere((c) => c.id == id);

  static List<Harvest> harvests() => [
        Harvest(id: 'h48', crop: crop('tomatoes'), kg: 400, when: 'Today', trace: 'VF-TOM-00048', status: HarvestStatus.waiting),
        Harvest(id: 'h31', crop: crop('pepper'), kg: 120, when: 'Monday', trace: 'VF-PEP-00031', status: HarvestStatus.collected),
        Harvest(id: 'h19', crop: crop('okra'), kg: 60, when: 'Saturday', trace: 'VF-OKR-00019', status: HarvestStatus.sold),
        Harvest(id: 'h12', crop: crop('garden-eggs'), kg: 210, when: '8 Oct', trace: 'VF-GEG-00012', status: HarvestStatus.collected),
        Harvest(id: 'h07', crop: crop('onions'), kg: 300, when: '2 Oct', trace: 'VF-ONI-00007', status: HarvestStatus.collected),
        Harvest(id: 'h05', crop: crop('okra'), kg: 150, when: '28 Sep', trace: 'VF-OKR-00005', status: HarvestStatus.sold),
      ];

  static List<Offer> offers() => [
        Offer(id: 'o1', buyer: 'Accra Fresh Market', crop: crop('tomatoes'), kg: 400, theirPrice: 9.5, yourPrice: 9, trace: 'VF-TOM-00048', collection: 'Thursday, Techiman', hoursLeft: 47),
      ];

  static List<Order> orders() => [
        Order(id: 'VF-ORD-2291', buyer: 'Accra Fresh Market', crop: crop('tomatoes'), kg: 400, note: 'Collect Thursday', tag: 'Accepted', stage: OrderStage.open),
        Order(id: 'VF-ORD-2287', buyer: 'Kumasi Grand Hotel', crop: crop('garden-eggs'), kg: 150, note: 'Collect Friday', tag: 'Accepted', stage: OrderStage.open),
        Order(id: 'VF-ORD-2280', buyer: 'Makola Traders Union', crop: crop('pepper'), kg: 80, note: 'Waiting for your reply', tag: 'Reply', stage: OrderStage.open, needsReply: true),
        Order(id: 'VF-ORD-2276', buyer: 'Tema Foods Ltd', crop: crop('onions'), kg: 200, note: 'Counter sent', tag: 'Counter sent', stage: OrderStage.open),
        Order(id: 'VF-ORD-2251', buyer: 'Shoprite Accra Mall', crop: crop('pepper'), kg: 120, note: 'Collected Monday', tag: 'Collected', stage: OrderStage.collected),
        Order(id: 'VF-ORD-2240', buyer: 'Osu Kitchen Group', crop: crop('okra'), kg: 60, note: 'Paid 10 Oct', tag: 'Paid', stage: OrderStage.paid),
        Order(id: 'VF-ORD-2231', buyer: 'Tema Foods Ltd', crop: crop('onions'), kg: 300, note: 'Paid 3 Oct', tag: 'Paid', stage: OrderStage.paid),
      ];

  static const payments = [
    Payment('Pepper · 120 kg', 'Friday, 17 Oct', 2480, true),
    Payment('Okra · 60 kg', '10 Oct', 720, false),
    Payment('Garden eggs · 210 kg', '9 Oct', 1890, false),
    Payment('Onions · 300 kg', '3 Oct', 2700, false),
    Payment('Okra · 150 kg', '28 Sep', 1350, false),
    Payment('Tomatoes · 520 kg', '19 Sep', 4680, false),
  ];

  static List<Member> members() => [
        Member(name: 'Akosua Boateng', note: 'Chairperson · Key holder', saved: 1040, shares: 104, todayShares: 3),
        Member(name: 'Abena Owusu', note: 'Member since 2023', saved: 920, shares: 92, todayShares: 5),
        Member(name: 'Efua Mensah', note: 'On loan · GH₵ 330 due', saved: 760, shares: 76, onLoan: true, todayShares: 2),
        Member(name: 'Adwoa Asante', note: 'Late · GH₵ 440 due', saved: 610, shares: 61, present: false, apology: true, late: true, onLoan: true),
        Member(name: 'Yaa Nyarko', note: 'On loan · GH₵ 120 left', saved: 880, shares: 88, onLoan: true, todayShares: 4),
        Member(name: 'Ama Sarpong', note: 'Member since 2024', saved: 430, shares: 43, onLoan: true, todayShares: 1),
        Member(name: 'Esi Quaye', note: 'Key holder', saved: 990, shares: 99, present: false),
        Member(name: 'Afia Darko', note: 'Member since 2024', saved: 400, shares: 40, todayShares: 5),
        Member(name: 'Akua Frimpong', note: 'Member since 2023', saved: 710, shares: 71, todayShares: 3),
        Member(name: 'Maame Serwaa', note: 'Member since 2025', saved: 350, shares: 35, todayShares: 2),
      ];

  static List<Loan> loans() => [
        Loan(member: 'Adwoa Asante', amount: 440, note: 'was due 8 Oct', state: LoanState.late, left: 440),
        Loan(member: 'Efua Mensah', amount: 330, note: 'due today', state: LoanState.due, left: 330),
        Loan(member: 'Yaa Nyarko', amount: 120, note: 'left · due 29 Oct', state: LoanState.onTime, left: 120),
        Loan(member: 'Ama Sarpong', amount: 1100, note: 'due 12 Nov', state: LoanState.onTime, left: 1100),
        Loan(member: 'Abena Owusu', amount: 220, note: 'Loan cleared', state: LoanState.paid),
      ];

  static const visits = [
    Visit('Agyeman Farms', '9:00', 'Farm check · Tomatoes', 'Next', icon: 'sprout', route: '/officer/check'),
    Visit('Boakye Family Farm', '10:30', 'Log harvest · Garden eggs', 'To do', icon: 'scale', route: '/officer/log'),
    Visit('Nkwanta Women VSLA', '12:00', 'Group meeting', 'To do', icon: 'users', route: '/group'),
    Visit('Owusu Plots', '8:00', 'New farmer', 'Done', icon: 'user-check', route: '/officer/register'),
  ];

  static const farmers = [
    FarmerRow('Amina Agyeman', 'Agyeman Farms · Tomatoes', 'Verified'),
    FarmerRow('Kofi Boakye', 'Boakye Family Farm · Garden eggs', 'Visit due'),
    FarmerRow('Kwabena Owusu', 'Owusu Plots · Pepper', 'New'),
    FarmerRow('Adjoa Manu', 'Manu Farms · Okra', 'Verified'),
    FarmerRow('Yaw Appiah', 'Appiah Farms · Maize', 'Visit due'),
    FarmerRow('Grace Tetteh', 'Tetteh Farms · Onions', 'Verified'),
    FarmerRow('Amina Seidu', 'Seidu Plots · Tomatoes', 'Verified'),
    FarmerRow('Fati Alhassan', 'Alhassan Farm · Tomatoes', 'New'),
  ];

  static List<QueueItem> officerQueue() => [
        QueueItem('Farm check · Agyeman Farms', 'Today 9:20 · 2 photos', 'sprout', SyncState.sending),
        QueueItem('Harvest · Kofi Boakye', 'Today 10:42 · 210 kg', 'scale', SyncState.saved),
        QueueItem('New farmer · Kwabena Owusu', 'Today 8:15', 'user-check', SyncState.failed),
      ];
}
