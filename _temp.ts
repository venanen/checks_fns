const a = {
    name: 'Kirill',
    saName1: function(){
        console.log(this);
    },
    saName2: () => console.log(this)
}
Object.freeze(a)

a.saName1() // kirill
a.saName2() // kirill

let a1 = a.saName1
a1()

let a2 = a.saName2
a2()


const asyncFunction = async () => {
    return new Promise(resolve => setTimeout(resolve, 1000))
}
