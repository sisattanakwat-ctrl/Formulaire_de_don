'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Download, Calendar, Eye, EyeOff, Trash2, X, Mail, LogOut, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DEFAULT_FESTIVALS = [
  'Boun Makha bouxa',
  'Boun Nouvel an Lao',
  'Boun Visakha bouxa',
  'Boun Khao Phansa',
  'Boun Khoun Khao',
  'Boun Hork Khao Salak',
  'Boun Ok Phansa',
  'Boun Kathina'
];

// Amount presets
const AMOUNT_PRESETS = [5, 10, 50, 100];

// Multilingual labels
const LABELS = {
  templeName: {
    fr: 'Pagode Wat Sisattanak',
    lo: 'ວັດສິສັດຕະນັກ'
  },
  civility: {
    fr: 'Civilité',
    lo: 'ສັນຊາດ'
  },
  lastName: {
    fr: 'Nom',
    lo: 'ນາມສະກຸນ'
  },
  firstName: {
    fr: 'Prénom',
    lo: 'ຊື່'
  },
  address: {
    fr: 'Adresse',
    lo: 'ທີ່'
  },
  postalCode: {
    fr: 'Code postal',
    lo: 'ລະຫສ'
  },
  commune: {
    fr: 'Commune',
    lo: 'ເມບ'
  },
  email: {
    fr: 'Email',
    lo: 'ອີເມວ'
  },
  phone: {
    fr: 'Téléphone',
    lo: 'ເບີໂທລະສັບ'
  },
  paymentMethod: {
    fr: 'Mode de paiement',
    lo: 'ວິທີການ'
  },
  cash: {
    fr: 'Espèces',
    lo: 'ສົດ'
  },
  check: {
    fr: 'Chèque',
    lo: 'ການຊຳລະເງິນ'
  },
  donDuJour: {
    fr: 'Dons du jour',
    lo: 'ການບໍລິຈາກປະຈຳວັນ'
  },
  plateauCeleste: {
    fr: 'Plateau céleste',
    lo: 'ຈານຂວາງຟ້າ'
  },
  effetsUsuels: {
    fr: 'Effets usuels des moines',
    lo: 'ສິ່ງຂອງພຣະສົງ'
  },
  entretien: {
    fr: 'Entretien de la pagode',
    lo: 'ການບຳລຸງຮັກສາວ'
  },
  amount: {
    fr: 'Montant (€)',
    lo: 'ຈຳນວນເງິນ (€)'
  },
  festival: {
    fr: 'Fête',
    lo: 'ງານບຸນ'
  },
  search: {
    fr: 'Rechercher par téléphone',
    lo: 'ຄົ້ນຫາຕາມເບີໂທລະສັບ'
  },
  searchButton: {
    fr: 'Rechercher',
    lo: 'ຄົ້ນຫາ'
  },
  submit: {
    fr: 'Valider le don',
    lo: 'ຢັ້ງຢືນການບໍລິຈາກ'
  },
  title: {
    fr: 'Formulaire de don',
    lo: 'ແບບຟອມບໍລິຈາກ'
  },
  totalDonations: {
    fr: 'Total des dons',
    lo: 'ການບໍລິຈາກທັງໝົດ'
  },
  statistics: {
    fr: 'Statistiques',
    lo: 'ສະຖິຕິ'
  },
  donationCount: {
    fr: 'Nombre de dons',
    lo: 'ຈຳນວນການບໍລິຈາກ'
  },
  uniqueDonors: {
    fr: 'Donateurs uniques',
    lo: 'ຜູ້ບໍລິຈາກທີ່ແຕກ຿'
  },
  closeDonations: {
    fr: 'Clôture des dons',
    lo: 'ປິດການບໍລິຈາກ'
  },
  export: {
    fr: 'Exporter Excel',
    lo: 'ສົ່ງອອ Excel'
  },
  showStats: {
    fr: 'Afficher les statistiques',
    lo: 'ສະແດງສະຖິຕິ'
  },
  hideStats: {
    fr: 'Masquer les statistiques',
    lo: 'ເຊື່ອງສະຖິຕິ'
  },
  deceasedNames: {
    fr: 'Pour dédier aux ancêtres et parents défunts dont les noms ci-dessous:',
    lo: 'ເພື່ອະນຸສານັກ ແລະ ພໍ່ມີຊື່ຂ້າງລຸງຮັກສາວ'
  },
  deceased: {
    fr: 'Défunt',
    lo: 'ຜູ້ຕາຍ'
  },
  addFestival: {
    fr: 'Ajouter fête',
    lo: 'ເພີ່ມງານບຸນ'
  },
  newFestival: {
    fr: 'Nouvelle fête',
    lo: 'ງານບຸນໃຝ່'
  },
  sendByEmail: {
    fr: 'Envoyer le reçu par email',
    lo: 'ສົ່ງໃບຮັບໂດຍອີເມວ'
  },
  emailSent: {
    fr: 'Reçu envoyé par email!',
    lo: 'ໃບຮັບສົ່ງອີເມວແລ້ວ!'
  },
  sendByPhone: {
    fr: 'Envoyer le reçu par SMS (bientôt disponible)',
    lo: 'ສົ່ງໃບຮັບໂດຍ SMS (ເປັນໄປໄດ້ໃນໄວໆນີ້)'
  }
};

export default function DonationForm() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    // Also check if token exists in localStorage
    if (token) {
      // Decode token to get role
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString()
          );
          setIsAuthenticated(true);
          setIsAdmin(payload.role === 'admin');
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    // Clear cookie by calling logout API
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }

    router.push('/login');
  };

  const [formData, setFormData] = useState({
    civility: '',
    lastName: '',
    firstName: '',
    address: '',
    postalCode: '',
    commune: '',
    email: '',
    phone: '',
    paymentMethod: '',
    donDuJourAmount: '',
    plateauCelesteAmount: '',
    effetsUsuelsAmount: '',
    entretienAmount: '',
    deceasedName1: '',
    deceasedName2: '',
    deceasedName3: '',
    deceasedName4: '',
    festivalName: ''
  });

  const [festivals, setFestivals] = useState(DEFAULT_FESTIVALS);
  const [newFestival, setNewFestival] = useState('');
  const [showNewFestival, setShowNewFestival] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [donationCount, setDonationCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Calculate total amount as user types
  const currentTotal = 
    (parseFloat(formData.donDuJourAmount) || 0) +
    (parseFloat(formData.plateauCelesteAmount) || 0) +
    (parseFloat(formData.effetsUsuelsAmount) || 0) +
    (parseFloat(formData.entretienAmount) || 0);

  // Get today's date (memoized to prevent hydration mismatch)
  const today = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Fetch total amount on mount
  useEffect(() => {
    if (formData.festivalName) {
      fetchTotalAmount();
      fetchStatistics();
    }
  }, [formData.festivalName]);

  const fetchTotalAmount = async () => {
    try {
      const response = await fetch('/api/festivals');
      const data = await response.json();
      if (data.success) {
        const festival = data.festivals.find((f: any) => f.name === formData.festivalName);
        if (festival) {
          setTotalAmount(festival.counter);
        }
      }
    } catch (error) {
      console.error('Error fetching total amount:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`/api/statistics?festivalName=${encodeURIComponent(formData.festivalName)}`);
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
        setDonationCount(data.statistics.donationCount);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Réinitialiser l'indicateur de soumission quand l'utilisateur modifie le formulaire
    if (formSubmitted) {
      setFormSubmitted(false);
    }
  };

  const handleSearchByPhone = async () => {
    if (!formData.phone) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }

    try {
      const response = await fetch(`/api/donors/search?phone=${encodeURIComponent(formData.phone)}`);
      const data = await response.json();
      
      if (data.success && data.donor) {
        setFormData(prev => ({
          ...prev,
          civility: data.donor.civility || '',
          lastName: data.donor.lastName,
          firstName: data.donor.firstName,
          address: data.donor.address || '',
          postalCode: data.donor.postalCode || '',
          commune: data.donor.commune || '',
          email: data.donor.email || ''
        }));
        toast.success('Donateur trouvé! Informations remplies automatiquement.');
      } else {
        toast.info('Aucun donateur trouvé avec ce numéro');
      }
    } catch (error) {
      console.error('Error searching donor:', error);
      toast.error('Erreur lors de la recherche');
    }
  };

  const generateReceiptPDF = async () => {
    try {
      const response = await fetch('/api/generate-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount: currentTotal
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu_don_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Reçu de don généré avec succès!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Erreur lors de la génération du reçu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentTotal <= 0) {
      toast.error('Veuillez entrer au moins un montant');
      return;
    }

    if (!formData.paymentMethod) {
      toast.error('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (sendEmail && !formData.email) {
      toast.error('Veuillez entrer une adresse email pour envoyer le reçu');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setTotalAmount(data.totalAmount);
        setDonationCount(prev => prev + 1);
        
        // Send email if requested
        if (sendEmail && formData.email) {
          try {
            const emailResponse = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...formData,
                totalAmount: currentTotal,
                donationDate: new Date()
              })
            });
            
            const emailData = await emailResponse.json();
            if (emailData.success) {
              toast.success(LABELS.emailSent.fr + ' / ' + LABELS.emailSent.lo);
            } else if (emailData.warning) {
              toast.warning(emailData.warning);
            }
          } catch (emailError) {
            console.error('Error sending email:', emailError);
            toast.error('Erreur lors de l\'envoi de l\'email, mais le don a été enregistré');
          }
        }
        
        // Generate and download PDF receipt
        await generateReceiptPDF();
        
        toast.success(`Merci pour votre don de ${currentTotal}€!`);
        
        // Reset form (mais garde l'email pour la prochaine fois)
        setFormData(prev => ({
          civility: '',
          lastName: '',
          firstName: '',
          address: '',
          postalCode: '',
          commune: '',
          email: prev.email, // Conserver l'email
          phone: '',
          paymentMethod: '',
          donDuJourAmount: '',
          plateauCelesteAmount: '',
          effetsUsuelsAmount: '',
          entretienAmount: '',
          deceasedName1: '',
          deceasedName2: '',
          deceasedName3: '',
          deceasedName4: '',
          festivalName: formData.festivalName
        }));
        
        setFormSubmitted(true);
      } else {
        toast.error('Erreur lors de l\'enregistrement du don');
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      toast.error('Erreur lors de l\'enregistrement du don');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFestival = () => {
    if (newFestival && !festivals.includes(newFestival)) {
      setFestivals([...festivals, newFestival]);
      setFormData(prev => ({ ...prev, festivalName: newFestival }));
      setNewFestival('');
      setShowNewFestival(false);
      toast.success('Nouvelle fête ajoutée!');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`/api/export?festivalName=${encodeURIComponent(formData.festivalName)}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dons_${formData.festivalName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export Excel réussi!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Erreur lors de l\'export Excel');
    }
  };

  const handleClearAmount = (field: 'donDuJour' | 'plateauCeleste' | 'effetsUsuels' | 'entretien') => {
    setFormData(prev => ({ ...prev, [`${field}Amount`]: '' }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Compact Header */}
      <div className="w-full h-32 relative">
        <img
          src="/donation-header.jpg"
          alt="Offrandes traditionnelles laotiennes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-50/95"></div>
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center w-full px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-center">
              <h1 className="text-xl md:text-2xl font-bold text-amber-900 mb-1">
                {LABELS.templeName.fr} / {LABELS.templeName.lo}
              </h1>
              <p className="text-base md:text-lg text-amber-800">
                {LABELS.title.fr} / {LABELS.title.lo}
              </p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors"
                  title="Administration"
                >
                  <Users className="h-5 w-5 text-amber-900" />
                </button>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5 text-amber-900" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Optimized for tablet */}
      <main className="flex-1 container mx-auto px-2 md:px-4 py-3 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Donation Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-amber-100 border-b-2 border-amber-200 py-3 px-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-xl text-amber-900">
                    {LABELS.title.fr} / {LABELS.title.lo}
                  </CardTitle>
                  {/* Counter */}
                  <div className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm md:text-base">
                    <span className="font-semibold">{LABELS.totalDonations.fr}:</span>
                    <span className="text-lg font-bold">{totalAmount.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4">
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  {/* Festival & Date Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    <div className="col-span-1">
                      <Label className="mb-1 block font-semibold text-sm md:text-base">
                        {LABELS.festival.fr} / {LABELS.festival.lo}
                      </Label>
                      <Select value={formData.festivalName} onValueChange={(value) => setFormData(prev => ({ ...prev, festivalName: value }))}>
                        <SelectTrigger className="h-9 md:h-10 text-sm">
                          <SelectValue placeholder={LABELS.festival.fr} />
                        </SelectTrigger>
                        <SelectContent>
                          {festivals.map((festival) => (
                            <SelectItem key={festival} value={festival} className="text-sm">
                              {festival}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Dialog open={showNewFestival} onOpenChange={setShowNewFestival}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" className="h-9 md:h-10 w-full text-sm self-end">
                            + {LABELS.addFestival.fr}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{LABELS.newFestival.fr} / {LABELS.newFestival.lo}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            <Input
                              placeholder="Nom de la fête"
                              value={newFestival}
                              onChange={(e) => setNewFestival(e.target.value)}
                            />
                            <Button onClick={handleAddFestival} className="w-full">
                              {LABELS.addFestival.fr}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                      <div className="flex-1 p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs md:text-sm font-semibold text-amber-900 truncate" suppressHydrationWarning>
                          {today}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DONOR INFORMATION SECTION - MOVED UP */}
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <h3 className="text-base md:text-lg font-bold text-amber-900 mb-2 md:mb-3">
                      {LABELS.search.fr} / {LABELS.search.lo}
                    </h3>
                    
                    {/* Phone Search */}
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Téléphone"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        className="text-sm"
                        required
                      />
                      <Button type="button" variant="outline" onClick={handleSearchByPhone}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                      <div>
                        <Label className="mb-1 block font-semibold text-xs md:text-sm">
                          {LABELS.civility.fr} / {LABELS.civility.lo}
                        </Label>
                        <Select value={formData.civility} onValueChange={(value) => setFormData(prev => ({ ...prev, civility: value }))}>
                          <SelectTrigger className="h-9 md:h-10 text-sm">
                            <SelectValue placeholder={LABELS.civility.fr} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M.">M.</SelectItem>
                            <SelectItem value="Mme">Mme</SelectItem>
                            <SelectItem value="M. & Mme.">M. & Mme.</SelectItem>
                            <SelectItem value="Famille">Famille</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-1 block font-semibold text-xs md:text-sm">
                          {LABELS.firstName.fr}
                        </Label>
                        <Input
                          placeholder={LABELS.firstName.fr}
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="h-9 md:h-10 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block font-semibold text-xs md:text-sm">
                          {LABELS.lastName.fr}
                        </Label>
                        <Input
                          placeholder={LABELS.lastName.fr}
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="h-9 md:h-10 text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-3 md:col-span-3">
                        <Label className="mb-1 block font-semibold text-xs md:text-sm">
                          {LABELS.address.fr} / {LABELS.address.lo}
                        </Label>
                        <Input
                          placeholder={LABELS.address.fr}
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="h-9 md:h-10 text-sm"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <Label className="mb-1 block font-semibold text-xs md:text-sm">
                          {LABELS.postalCode.fr} / {LABELS.postalCode.lo}
                        </Label>
                        <Input
                          placeholder={LABELS.postalCode.fr}
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value.slice(0, 7) }))}
                          className="h-9 md:h-10 text-sm"
                          maxLength={7}
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <Label className="mb-1 block font-semibold text-xs md:text-sm">
                          {LABELS.commune.fr} / {LABELS.commune.lo}
                        </Label>
                        <Input
                          placeholder={LABELS.commune.fr}
                          value={formData.commune}
                          onChange={(e) => setFormData(prev => ({ ...prev, commune: e.target.value }))}
                          className="h-9 md:h-10 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block font-semibold text-xs md:text-sm">
                          {LABELS.email.fr} / {LABELS.email.lo}
                        </Label>
                        <Input
                          type="email"
                          placeholder={LABELS.email.fr}
                          value={formData.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          className="h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT METHOD */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="col-span-2">
                      <Label className="mb-1 block font-semibold text-sm md:text-base">
                        {LABELS.paymentMethod.fr} / {LABELS.paymentMethod.lo}
                      </Label>
                      <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger className="h-9 md:h-10 text-sm">
                          <SelectValue placeholder={LABELS.paymentMethod.fr} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">{LABELS.cash.fr} / {LABELS.cash.lo}</SelectItem>
                          <SelectItem value="check">{LABELS.check.fr} / {LABELS.check.lo}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* DONATION CATEGORIES - Compact with Buttons */}
                  <div className="space-y-3">
                    <h3 className="text-base md:text-lg font-bold text-amber-900">
                      {LABELS.donDuJour.fr} / {LABELS.donDuJour.lo}
                    </h3>
                    
                    {/* Dons du jour */}
                    <div className="bg-white p-3 rounded-lg border-2 border-amber-200">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                          <Label className="text-sm font-semibold">{LABELS.donDuJour.fr}</Label>
                          <p className="text-xs text-gray-600">{LABELS.donDuJour.lo}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.donDuJourAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, donDuJourAmount: e.target.value }))}
                            className="text-base font-semibold"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearAmount('donDuJour')}
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {AMOUNT_PRESETS.map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={formData.donDuJourAmount === amount.toString() ? 'bg-amber-100 border-amber-600' : 'px-3 py-1'}
                              onClick={() => setFormData(prev => ({ ...prev, donDuJourAmount: amount.toString() }))}
                            >
                              {amount}€
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Plateau céleste */}
                    <div className="bg-white p-3 rounded-lg border-2 border-amber-200">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                          <Label className="text-sm font-semibold">{LABELS.plateauCeleste.fr}</Label>
                          <p className="text-xs text-gray-600">{LABELS.plateauCeleste.lo}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.plateauCelesteAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, plateauCelesteAmount: e.target.value }))}
                            className="text-base font-semibold"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearAmount('plateauCeleste')}
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {AMOUNT_PRESETS.map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={formData.plateauCelesteAmount === amount.toString() ? 'bg-amber-100 border-amber-600' : 'px-3 py-1'}
                              onClick={() => setFormData(prev => ({ ...prev, plateauCelesteAmount: amount.toString() }))}
                            >
                              {amount}€
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Effets usuels */}
                    <div className="bg-white p-3 rounded-lg border-2 border-amber-200">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                          <Label className="text-sm font-semibold">{LABELS.effetsUsuels.fr}</Label>
                          <p className="text-xs text-gray-600">{LABELS.effetsUsuels.lo}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.effetsUsuelsAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, effetsUsuelsAmount: e.target.value }))}
                            className="text-base font-semibold"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearAmount('effetsUsuels')}
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {AMOUNT_PRESETS.map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={formData.effetsUsuelsAmount === amount.toString() ? 'bg-amber-100 border-amber-600' : 'px-3 py-1'}
                              onClick={() => setFormData(prev => ({ ...prev, effetsUsuelsAmount: amount.toString() }))}
                            >
                              {amount}€
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Entretien pagode */}
                    <div className="bg-white p-3 rounded-lg border-2 border-amber-200">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex-shrink-0">
                          <Label className="text-sm font-semibold">{LABELS.entretien.fr}</Label>
                          <p className="text-xs text-gray-600">{LABELS.entretien.lo}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.entretienAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, entretienAmount: e.target.value }))}
                            className="text-base font-semibold"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearAmount('entretien')}
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {AMOUNT_PRESETS.map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={formData.entretienAmount === amount.toString() ? 'bg-amber-100 border-amber-600' : 'px-3 py-1'}
                              onClick={() => setFormData(prev => ({ ...prev, entretienAmount: amount.toString() }))}
                            >
                              {amount}€
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-3 rounded-lg border-2 border-amber-400">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base md:text-lg font-bold text-amber-900">{LABELS.totalDonations.fr}</span>
                        <span className="text-xl md:text-2xl font-bold text-amber-900">{currentTotal.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>

                    {/* DECEASED NAMES - Compact */}
                    <div className="space-y-2">
                    <Label className="mb-1 block font-semibold text-sm md:text-base text-amber-900">
                      {LABELS.deceasedNames.fr} / {LABELS.deceasedNames.lo}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <Input
                          key={num}
                          placeholder={`${LABELS.deceased.fr} ${num}`}
                          value={formData[`deceasedName${num}` as keyof typeof formData]}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            [`deceasedName${num}`]: e.target.value 
                          }))}
                          className="h-9 md:h-10 text-sm"
                        />
                      ))}
                    </div>
                  </div>
                  </div>

                  {/* Email & SMS Options */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="send-email"
                        checked={sendEmail}
                        onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                      />
                      <Label
                        htmlFor="send-email"
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        {LABELS.sendByEmail.fr} / {LABELS.sendByEmail.lo}
                      </Label>
                    </div>
                    {sendEmail && !formData.email && !formSubmitted && (
                      <p className="text-xs text-amber-700 ml-6">
                        ⚠️ Veuillez renseigner votre adresse email pour recevoir le reçu
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 md:py-6 text-base md:text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : (LABELS.submit.fr + ' / ' + LABELS.submit.lo)}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="bg-amber-100 border-b-2 border-amber-200 py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-amber-900">
                    {LABELS.statistics.fr} / {LABELS.statistics.lo}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowStats(!showStats)}
                    className="h-8 w-8"
                  >
                    {showStats ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {showStats ? (
                  <div className="space-y-3">
                    {/* Total Amount */}
                    <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-xs md:text-sm text-amber-700 font-semibold">
                        {LABELS.totalDonations.fr} / {LABELS.totalDonations.lo}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-amber-900">
                        {totalAmount.toLocaleString('fr-FR')} €
                      </p>
                    </div>

                    {/* Donation Count */}
                    <div className="bg-white p-3 rounded-lg border-amber-200">
                      <p className="text-xs md:text-sm text-amber-700 font-semibold">
                        {LABELS.donationCount.fr} / {LABELS.donationCount.lo}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-amber-900">
                        {donationCount}
                      </p>
                    </div>

                    {/* Unique Donors */}
                    {statistics && (
                      <div className="bg-white p-3 rounded-lg border-amber-200">
                        <p className="text-xs md:text-sm text-amber-700 font-semibold">
                          {LABELS.uniqueDonors.fr} / {LABELS.uniqueDonors.lo}
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-amber-900">
                          {statistics.uniqueDonorCount}
                        </p>
                      </div>
                    )}

                    {/* Export Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-amber-600 text-amber-700 hover:bg-amber-50 text-sm md:text-base py-2"
                      onClick={handleExportExcel}
                      disabled={!formData.festivalName}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {LABELS.export.fr} / {LABELS.export.lo}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Eye className="h-10 w-10 md:h-12 md:w-12 text-amber-300 mx-auto mb-3" />
                    <p className="text-sm md:text-base text-amber-700 font-semibold">
                      {LABELS.showStats.fr} / {LABELS.showStats.lo}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Compact Footer */}
      <footer className="mt-auto bg-stone-800 text-stone-100 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base font-semibold mb-1">
            {LABELS.templeName.fr} / {LABELS.templeName.lo}
          </p>
          <p className="text-xs md:text-sm">
            © 2025 {LABELS.templeName.fr} - {LABELS.title.fr}
          </p>
        </div>
      </footer>
    </div>
  );
}
