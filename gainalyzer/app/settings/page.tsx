'use client'

export default function Sidebar() {
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


