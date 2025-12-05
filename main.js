document.body.classList.add('no-scroll');

async function initializeApp() {
    document.getElementById('fileInput').addEventListener('change', async function (e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('fileName').textContent = `Selected: ${file.name}`;
            document.getElementById('loading').style.display = 'block';
            document.getElementById('fileUpload').style.display = 'none';
            
            try {
                const { catData, breedColors } = await window.loadData(file, window.generateDistinctColors);
                
                document.getElementById('loading').style.display = 'none';
                document.getElementById('fileUpload').style.display = 'none';
                document.getElementById('narrativeText').style.display = 'block';
                
                document.body.classList.remove('no-scroll');
                
                const scatterState = window.createScatterPlot(catData, breedColors, window.recommendationMetrics);
                
                window.filteredBreedStats = scatterState.filteredBreedStats;
                
                window.initializeScrollController(catData, breedColors, window.narratives);
                
                window.updateScatterPlot(0);
                
            } catch (error) {
                console.error(error);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('fileUpload').style.display = 'block';
                alert('Error processing file. Please make sure you uploaded the correct Excel file.');
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}