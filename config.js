const narratives = [
    "You may have heard of cat breed stereotypes, like Russian Blues being shy or Siamese being very affectionate. If you're not a cat person, perhaps you've heard all cats are antisocial. Do these stereotypes hold true when we look at actual data? Let's find out together! First, hover over the dot farthest to the right to see which breed scores highest in human sociability.",
    
    "Great! Siamese and Balinese score as most social with humans, which goes right along with their stereotypical description. Now hover over the dot farthest to the left to discover which breed is least social with humans.",
    
    "Excellent! Persian and Exotic has the lowest human sociability score, which somewhat matches the stereotype. These cats are generally described as calm with selective sociable behavior, only showing true comfortability around family. What about Russian Blues? They are often described as one of the most shy cats, so where does their human sociability score fall? Hover over Russian Blue in the list to the right to find out!",
    
    "Awesome! You'll see Russian Blues actually have a mid-range human sociability score among the different breeds, partially debunking the stereotype. Now let's look at cat-to-cat relationships. Hover over the dot farthest up to see which breed is most social with other cats.",
    
    "Perfect! It's the Oriental cat, which completely matches the stereotype that they are highly social and love a companion. Finally, hover over the dot farthest down to find which breed is least social with other cats.",
    
    "Woah! It's a Somali. If you've heard anything about Somalis before, you may be surprised by this! People generally say they are very social, active, and playful with other cats. Now that you've seen the extremes, feel free to explore more breeds on your own. Hover over any dot or breed name to see their scores. When you're ready to zoom out and see the full picture, scroll down to continue.",
    
    "Let's zoom out! The data shows that some breeds seem to match their stereotypes and other oppose them. However, it is important to look at the individual variation within each breed. Every cat is unique, and the data really shows that!! Take a look. Hover over the dots or breeds to see all the individual cats' sociability scores within that breed. You'll see that individuals vary far more from one another than the difference between any breed averages.",
    
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