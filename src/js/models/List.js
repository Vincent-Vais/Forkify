import uniqid from "uniqid";

export default class List{
    constructor(){
        this.items = [];
    }
    addItem(count, unit, ingredient){
        const item = {id: uniqid(), count, unit, ingredient};
        this.items.push(item);
    }

    deleteItem(id){
        const idx = this.items.findIndex(item => item.id === id);
        this.items.splice(idx, 1);
    }

    updateCount(id, newCount){
        this.items.find(item => item.id === id).count = newCount;
    }
}