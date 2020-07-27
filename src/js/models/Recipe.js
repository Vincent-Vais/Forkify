import axios from "axios";

export default class Recipe{
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }catch(error){
            console.log("Error! ", error)
        }
    }

    calcTime(){
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitLongs = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitShorts = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitShorts, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el => {
            // 1. Uniform units
            let ingredient = el.toLowerCase();
            unitLongs.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShorts[i]);
            });
            // 2. Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            ingredient = ingredient.replace(',', '');
            // 3. Parse ingredients into count, unit, ingredient
            const arrIng = ingredient.split(' ');
            const unitIdx = arrIng.findIndex(ing => units.includes(ing));

            let objIng;
            if(unitIdx > -1){
                const arrCount = arrIng.slice(0, unitIdx);
                let count;
                if(arrCount.length === 1){
                    count = parseFloat(eval(arrIng[0].replace('-', '+')).toFixed(1));
                }else{
                    count = parseFloat(eval(arrCount.join("+")).toFixed(1));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIdx],
                    ingredient: arrIng.slice(unitIdx+1).join(' ')
                }
            }else if(parseInt(arrIng[0],10)){
                objIng = {
                    count: parseInt(arrIng[0],10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }else if(unitIdx === -1){
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type){
        // 1. Update servings (depends on type = "increase/decrease")
        const newServings = type === "decr" ? this.servings - 1 : this.servings + 1;
        // 2. Update ingredients (depends on type = "increase/decrease")
        this.ingredients.forEach(ingr => {
            ingr.count *= (newServings / this.servings);
        })
        this.servings = newServings;
    }
}