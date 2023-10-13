interface Menu {
    courses: Course[],
}

interface Course {
    diets: string[] | string;
    name: string,
    price: string;
}

interface MenuWeekly {
    days: Day[]
}

interface Day {
    date: string,
    courses: Course[]
}

export type {Menu, MenuWeekly, Course};
