'use client'

export default function Sidebar() {
    const today = new Date();
    console.log(today);
    const newDay = new Date();
    newDay.setDate(today.getDate() - 40);
    console.log(newDay)
    newDay.setDate(today.getDate() - 364);
    console.log(newDay)

    return (
        <>
            <div className="flex flex-row border p-2 m-5">
                <p>hello</p>
                <p>world</p>
                <p>today</p>
                <span>hello</span>
                <span>world</span>
            </div>
            <div className="flex border p-2">
                <div className="flex-1 border ">Child 1</div>
                <div className="flex-1 border">Child 2</div>
                <div className="flex-1 border ">Child 3</div>
            </div>
        </>
    );
}


