document.body.classList.add('no-scroll');

async function loadDefaultDataset() {
    try {
        console.log('Starting to load default dataset...');
        document.getElementById('loading').style.display = 'block';
        document.getElementById('fileUpload').style.display = 'none';
        
        const { catData, breedColors } = await window.loadData('Feline_dataset.xlsx');
        
        console.log('Loaded cat data:', catData.length, 'cats');
        console.log('Breed colors:', Object.keys(breedColors).length, 'breeds');
        
        if (catData.length === 0) {
            throw new Error('No cat data loaded');
        }
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('narrativeText').style.display = 'block';
        
        document.body.classList.remove('no-scroll');
        
        console.log('Creating scatter plot...');
        const scatterState = window.createScatterPlot(catData, breedColors, window.recommendationMetrics);
        
        window.filteredBreedStats = scatterState.filteredBreedStats;
        
        console.log('Initializing scroll controller...');
        window.initializeScrollController(catData, breedColors, window.narratives);
        
        window.updateScatterPlot(0);
        
        console.log('Visualization loaded successfully!');
        
    } catch (error) {
        console.error('Error loading default dataset:', error);
        console.error('Error stack:', error.stack);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('fileUpload').style.display = 'block';
        alert('Error loading default dataset: ' + error.message + '. You can upload the file manually.');
    }
}

async function initializeApp() {
    loadDefaultDataset();
    
    document.getElementById('fileInput').addEventListener('change', async function (e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('fileName').textContent = `Selected: ${file.name}`;
            document.getElementById('loading').style.display = 'block';
            document.getElementById('fileUpload').style.display = 'none';
            
            try {
                const { catData, breedColors } = await window.loadData(file);
                
                console.log('Loaded cat data:', catData.length, 'cats');
                console.log('Breed colors:', Object.keys(breedColors).length, 'breeds');
                
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
