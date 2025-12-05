const narratives = [
    "You may have heard of cat breed stereotypes, like Russian Blues being shy or Siamese being demanding. If you're not a cat person, perhaps you've heard all cats are antisocial. Do these stereotypes hold true when we look at actual data? Hover over the breed names or dots to explore how different breeds truly rank in sociability towards humans and other cats. Scroll down to continue.",
    "Let's zoom out! The data shows that on average Siamese and Balinese are the most social towards humans, while Orientals are the most social towards other cats. However, let's not forget the individual variation within each breed. Every cat is unique, and they vary far more than any breed average. Hover over the dots or breeds to see all the individual cats' sociability scores within that breed. Scroll to continue.",
    "How do cats' personalities change as they age? Is this affected by gender? Let's explore the various metrics and see how they change throughout a cats life. Try out using cat years! Scroll to continue.",
    "Let's keep in mind that cat's are all incredibly different individuals, and they will change throughout their lives. That said, let's find your best bet for a perfect match! Select three different specific traits that are important to you, ranked by priority, and you'll see the most promising cat breeds for you."
];

const recommendationMetrics = [
    { key: 'seeks_physical_contact_people', label: 'Seeks Physical Contact with People', category: 'Social' },
    { key: 'comfortable_social_gatherings', label: 'Comfortable with Social Gatherings', category: 'Social' },
    { key: 'enjoys_jumping_high_places', label: 'Loves to Jump High', category: 'Social' },
    { key: 'meows_to_people', label: 'Talks to People', category: 'Social' },
    { key: 'comfortable_petted_strangers', label: 'Comfortable Being Petted by Strangers', category: 'Social' },
    { key: 'gets_along_other_cats', label: 'Gets Along with Other Cats', category: 'Social' },
    { key: 'purrs_when_petted', label: 'Purrs When Petted', category: 'Affectionate' },
    { key: 'purrs_in_lap', label: 'Purrs While Sitting in Lap', category: 'Affectionate' },
    { key: 'checks_on_crying_baby', label: 'Checks on Crying Baby', category: 'Affectionate' },
    { key: 'gets_zoomies', label: 'Gets Zoomies (Bursts of Running)', category: 'Playful' },
    { key: 'excited_about_new_toys', label: 'Excited About New Toys', category: 'Playful' },
    { key: 'plays_fetch', label: 'Plays Fetch', category: 'Playful' },
    { key: 'poops_in_right_place', label: 'Uses Litter Box Properly', category: 'Good Habits' },
    { key: 'pees_in_right_place', label: 'Urinates in Appropriate Places', category: 'Good Habits' },
    { key: 'no_scratch_bite', label: 'Doesn\'t Unexpectedly Scratch or Bite', category: 'Good Habits' },
    { key: 'no_bite_scratch_familiar_dogs', label: 'Doesn\'t Bite/Scratch Familiar Dogs', category: 'Good Habits' },
    { key: 'no_scrach_innapropriate_obj', label: 'Doesn\'t Scratch Inappropriate Objects', category: 'Good Habits' },
    { key: 'no_chew_cable_wires', label: 'Doesn\'t Chew Cables/Wires', category: 'Good Habits' },
    { key: 'not_picky_eater', label: 'Not a Picky Eater', category: 'Good Habits' },
    { key: 'comes_when_called', label: 'Comes When Called', category: 'Training' },
    { key: 'reacts_to_videos', label: 'Reacts to Videos on TV', category: 'Training' },
    { key: 'seems_confident', label: 'Seems Confident', category: 'Personality' },
    { key: 'moves_elegantly', label: 'Moves Elegantly', category: 'Personality' },
    { key: 'wakes_you_up_early', label: 'Tries to Wake You Up Early', category: 'Sleep' },
    { key: 'no_wake_you_up_early', label: 'Doesn\'t Wake You Up Early', category: 'Sleep' }
];

window.narratives = narratives;
window.recommendationMetrics = recommendationMetrics;