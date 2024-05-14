

export default function ConferencePage ({
    children,
}: {
    children: React.ReactNode;
}) {
    return(
        <div className=" md:container md:max-w-7xl  md:mx-auto">
            {children}
        </div>
    )
}