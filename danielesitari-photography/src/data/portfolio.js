// Date pentru portofoliu
export const portfolioImages = {
  individual: [
    {
      id: 'ind_001',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      category: 'individual',
      title: 'Portret Natural'
    },
    {
      id: 'ind_002',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
      category: 'individual',
      title: 'Portret Studio'
    },
    {
      id: 'ind_003',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      category: 'individual',
      title: 'Portret Masculin'
    },
    {
      id: 'ind_004',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      category: 'individual',
      title: 'Portret Feminin'
    },
    {
      id: 'ind_005',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
      category: 'individual',
      title: 'Portret Profesional'
    },
    {
      id: 'ind_006',
      url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
      category: 'individual',
      title: 'Portret Artistic'
    }
  ],
  family: [
    {
      id: 'fam_001',
      url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
      category: 'family',
      title: 'Familie în Natură'
    },
    {
      id: 'fam_002',
      url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800',
      category: 'family',
      title: 'Momente de Familie'
    },
    {
      id: 'fam_003',
      url: 'https://images.unsplash.com/photo-1543342384-1f1350e27861?w=800',
      category: 'family',
      title: 'Familie Fericită'
    },
    {
      id: 'fam_004',
      url: 'https://images.unsplash.com/photo-1542042161784-26ab9e041e89?w=800',
      category: 'family',
      title: 'Portret Familie'
    }
  ],
  carmoto: [
    {
      id: 'car_001',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      category: 'carmoto',
      title: 'Motocicletă Sportivă'
    },
    {
      id: 'car_002',
      url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
      category: 'carmoto',
      title: 'Automobil Luxury'
    },
    {
      id: 'car_003',
      url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
      category: 'carmoto',
      title: 'Mașină Clasică'
    },
    {
      id: 'car_004',
      url: 'https://images.unsplash.com/photo-1599912027954-937dc92947d6?w=800',
      category: 'carmoto',
      title: 'Motocicletă Custom'
    }
  ],
  wedding: [
    {
      id: 'wed_001',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      category: 'wedding',
      title: 'Ceremonie Nuntă'
    },
    {
      id: 'wed_002',
      url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
      category: 'wedding',
      title: 'Portret Miri'
    },
    {
      id: 'wed_003',
      url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
      category: 'wedding',
      title: 'Detalii Nuntă'
    },
    {
      id: 'wed_004',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      category: 'wedding',
      title: 'Momente Speciale'
    },
    {
      id: 'wed_005',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
      category: 'wedding',
      title: 'Emoție și Bucurie'
    },
    {
      id: 'wed_006',
      url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800',
      category: 'wedding',
      title: 'Prima Dans'
    }
  ]
};

export const getAllImages = () => {
  return [
    ...portfolioImages.individual,
    ...portfolioImages.family,
    ...portfolioImages.carmoto,
    ...portfolioImages.wedding
  ];
};

export const getImagesByCategory = (category) => {
  if (category === 'all') return getAllImages();
  return portfolioImages[category] || [];
};

export const categories = [
  { id: 'all', label: 'All', labelRo: 'Toate' },
  { id: 'individual', label: 'Individual', labelRo: 'Individual' },
  { id: 'family', label: 'Family', labelRo: 'Familie' },
  { id: 'carmoto', label: 'Car/Moto', labelRo: 'Mașini/Moto' },
  { id: 'wedding', label: 'Wedding', labelRo: 'Nunți' }
];
