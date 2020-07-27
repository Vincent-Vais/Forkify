import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import {elements, renderLoader, clearLoader} from "./views/base";
/*
Global state of the app
    # Search object
    # Current recipe object
    # SHopping list object
    # Liked recipes
*/
const state = {}

// SEARCH CONTROLLER
const controllSearh = async () => {
    // 1. Get query from the view
    const query = searchView.getInput();

    if(query){
        // 2. Create new search object and add to state
        state.search = new Search(query);
        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{
            // 4. Search for recipes
            await state.search.getResults();
            // 5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch(error){
            clearLoader();
            console.log("Error! ", error);
        }
    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controllSearh();
});

elements.searchResPages.addEventListener("click", e => {
    const btn = e.target.closest(".btn-inline")
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


// RECIPE CONTROLLER
const controllRecipe = async () => {
    // 1. Get ID from URL
    const id = window.location.hash.replace("#", "");
    if(id){
        // 2. Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        if(state.search) searchView.highlightSelected(id);
        // 3. Create a new Recipe object
        state.recipe = new Recipe(id);
        // 4. Get recipe data
        try{
            await state.recipe.getRecipe();
            // 5. Calc time and cal servings
            state.recipe.calcTime();
            state.recipe.calcServings();
            state.recipe.parseIngredients();
            // 6. Render recipes
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        }catch(error){
            console.log("Error! ", error);
        }
    }
}

["hashchange", "load"].forEach(event => window.addEventListener(event, controllRecipe));

elements.recipe.addEventListener("click", e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings("decr");
        }
    }
    else if(e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings("incr");
    }
    recipeView.updateServingsIngs(state.recipe);
});
