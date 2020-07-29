import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
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
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        }catch(error){
            console.log("Error! ", error);
        }
    }
}

["hashchange", "load"].forEach(event => window.addEventListener(event, controllRecipe));

// LIST CONTROLLER
const controlList = () => {
    // 1. Instanciate a new list if was not instanciated before
    if(!state.list) state.list = new List();
    // 2. Add each ingredient to a list and UI
    state.recipe.ingredients.forEach(ing => {
        const item = state.list.addItem(ing.count, ing.unit, ing.ingredient);
        listView.renderItem(item);
    });
}



// LIKES CONTROLLER
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();

    const currentId = state.recipe.id;

    if(!state.likes.isLiked(currentId)){
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);
    }else{
        state.likes.deleteLike(currentId);
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore likes recipe on page loads
window.addEventListener("load", () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// EVENTS ON SHOPPING LIST
elements.shopping.addEventListener("click", e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        listView.deleteItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

// EVENTS ON RECIPE 
elements.recipe.addEventListener("click", e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings("decr");
            recipeView.updateServingsIngs(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings("incr");
        recipeView.updateServingsIngs(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});
