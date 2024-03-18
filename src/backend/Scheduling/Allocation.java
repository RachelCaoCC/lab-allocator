package Scheduling;

import Courses.Course;

/**
 * An allocation for a particular room at a particular time.
 */
public class Allocation {
    /**
     * The id of the course which this is an allocation of.
     */
    private Course course;
    public Course getCourse() {
        return course;
    }

    /**
     * The number of students that are scheduled in this room.
     */
    private int count;
    public int getCount() {
        return count;
    }

    Allocation(Course course, int count) {
        this.course = course;
        this.count = count;
    }
}
