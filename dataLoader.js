async function loadData(file, generateDistinctColors) {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[1]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const catData = jsonData.map((row, index) => ({
            id: `cat_${index}`,
            breed: row.BREEDGROUP || 'Mixed Breed',
            human_sociability: parseFloat(row.human_sociability),
            cat_sociability: parseFloat(row.cat_sociability),
            age: parseFloat(row.AGE_BEHAVIOUR),
            gender: row.SEX,
            fearfulness: parseFloat(row.fearfulness),
            human_aggression: parseFloat(row.human_aggression),
            activity_playfulness: parseFloat(row.activity_playfulness),
            litterbox_issues: parseFloat(row.litterbox_issues),
            excessive_grooming: parseFloat(row.excessive_grooming),
            seeks_physical_contact_people: parseFloat(row.seeks_physical_contact_people),
            comfortable_social_gatherings: parseFloat(row.comfortable_social_gatherings),
            enjoys_jumping_high_places: parseFloat(row.Enjoys_jumping_high),
            reacts_to_videos: parseFloat(row.Reacts_to_video_TV),
            seems_confident: parseFloat(row.Seems_confident),
            poops_in_right_place: 6.0 - parseFloat(row.Defecates_inappropriate_places),
            pees_in_right_place: 6.0 - parseFloat(row.Urinates_inappropriate),
            no_scratch_bite: 6.0 - parseFloat(row["Unexpectedly_scratches _bites"]),
            wakes_you_up_early: parseFloat(row.Tries_wake_up),
            no_wake_you_up_early: 6.0 - parseFloat(row.Tries_wake_up),
            gets_zoomies: parseFloat(row.exhibits_bursts_running),
            meows_to_people: parseFloat(row.Talks_to_people),
            purrs_when_petted: parseFloat(row.purrs_petted),
            no_bite_scratch_familiar_dogs: 6.0 - parseFloat(row.scratch_bite_familiar_dogs),
            excited_about_new_toys: parseFloat(row.excited_new_toys),
            no_scrach_innapropriate_obj: 6.0 - parseFloat(row.Scratches_inappropriate_objects),
            plays_fetch: parseFloat(row.Plays_fetch),
            gets_along_other_cats: parseFloat(row["Gets_along _with_cats"]),
            checks_on_crying_baby: parseFloat(row.baby_cry_check),
            comes_when_called: parseFloat(row.Comes_called),
            no_chew_cable_wires: 6.0 - parseFloat(row.Chews_cables),
            comfortable_petted_strangers: parseFloat(row.comfortable_petted_unfamiliar_people),
            not_picky_eater: 6.0 - parseFloat(row.Picky),
            purrs_in_lap: parseFloat(row.Purrs_sitting_lap),
            moves_elegantly: parseFloat(row.Moves_elegantly)
        })).filter(cat =>
            !isNaN(cat.human_sociability) &&
            !isNaN(cat.cat_sociability)
        );

        console.log('Data loaded. Total cats:', catData.length);
        console.log('Sample cat:', catData[0]);
        console.log('All field names:', catData.length > 0 ? Object.keys(catData[0]) : 'No data');

        const uniqueBreeds = [...new Set(catData.map(cat => cat.breed))].sort();
        const colors = generateDistinctColors(uniqueBreeds.length);
        const breedColors = {};
        uniqueBreeds.forEach((breed, i) => {
            breedColors[breed] = colors[i];
        });

        return { catData, breedColors };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

window.loadData = loadData;