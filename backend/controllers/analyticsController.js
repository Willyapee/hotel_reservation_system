import db from '../config/db.js';
import { QueryTypes, Op } from 'sequelize';
export const getCustomerLoyaltyAnalyticsDB = async (req, res) => {
    try {
        console.log('📊 [FIXED ANALYTICS] Calculating customer loyalty...');
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        // FIXED QUERY: Join dengan room_reservations dan filter status room
        const loyaltyQuery = `
            WITH paid_reservations AS (
                SELECT 
                    r.id_user,
                    r.id_reservation,
                    r.reservation_date,
                    rr.status as room_status,
                    MIN(r.reservation_date) OVER (PARTITION BY r.id_user) as user_first_booking
                FROM reservation r
                INNER JOIN invoice i ON r.id_reservation = i.id_reservation
                INNER JOIN room_reservations rr ON r.id_reservation = rr.id_reservation
                WHERE i.status = 'paid'
                    AND rr.status IN ('reserved', 'checked_in', 'checked_out')  -- TAMBAH FILTER INI!
                    AND r.reservation_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
            ),
            monthly_aggregation AS (
                SELECT 
                    YEAR(reservation_date) as year,
                    MONTH(reservation_date) as month,
                    id_user,
                    user_first_booking
                FROM paid_reservations
                WHERE room_status IN ('reserved', 'checked_in', 'checked_out')
                GROUP BY YEAR(reservation_date), MONTH(reservation_date), id_user, user_first_booking
            ),
            current_month_data AS (
                SELECT 
                    COUNT(DISTINCT id_user) as total_customers,
                    COUNT(DISTINCT CASE 
                        WHEN DATE_FORMAT(user_first_booking, '%Y-%m') = CONCAT(?, '-', LPAD(?, 2, '0')) 
                        THEN id_user 
                    END) as new_customers,
                    COUNT(DISTINCT CASE 
                        WHEN DATE_FORMAT(user_first_booking, '%Y-%m') < CONCAT(?, '-', LPAD(?, 2, '0')) 
                        THEN id_user 
                    END) as loyal_customers
                FROM monthly_aggregation
                WHERE year = ? AND month = ?
            ),
            monthly_trends AS (
                SELECT 
                    CONCAT(year, '-', LPAD(month, 2, '0')) as month_key,
                    COUNT(DISTINCT id_user) as total_customers,
                    COUNT(DISTINCT CASE 
                        WHEN DATE_FORMAT(user_first_booking, '%Y-%m') = CONCAT(year, '-', LPAD(month, 2, '0')) 
                        THEN id_user 
                    END) as new_customers,
                    COUNT(DISTINCT CASE 
                        WHEN DATE_FORMAT(user_first_booking, '%Y-%m') < CONCAT(year, '-', LPAD(month, 2, '0')) 
                        THEN id_user 
                    END) as loyal_customers
                FROM monthly_aggregation
                GROUP BY year, month
                ORDER BY year DESC, month DESC
                LIMIT 3
            )
            SELECT 
                (SELECT * FROM current_month_data) as current_month,
                (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'month_key', month_key,
                        'total_customers', total_customers,
                        'new_customers', new_customers,
                        'loyal_customers', loyal_customers
                    )
                ) FROM monthly_trends) as trends
        `;
        
        const loyaltyResult = await db.query(loyaltyQuery, {
            replacements: [currentYear, currentMonth, currentYear, currentMonth, currentYear, currentMonth],
            type: QueryTypes.SELECT
        });
        
        // [REST OF CODE REMAINS THE SAME...]
        
    } catch (error) {
        console.error('❌ Fixed loyalty query error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database query error in analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getTopSpendersAnalyticsDB = async (req, res) => {
    try {
        console.log('💰 [FIXED ANALYTICS] Fetching top spenders...');
        
        // FIXED QUERY: Pastikan ada room_reservations yang aktif
        const topSpendersQuery = `
            WITH user_spending AS (
                SELECT 
                    u.id_user,
                    u.username,
                    u.email,
                    u.role,
                    COUNT(DISTINCT r.id_reservation) as total_bookings,
                    COALESCE(SUM(i.total_amount), 0) as total_spent,
                    MAX(r.reservation_date) as last_booking_date,
                    COALESCE(AVG(i.total_amount), 0) as avg_booking_amount
                FROM ms_user u
                INNER JOIN reservation r ON u.id_user = r.id_user
                INNER JOIN invoice i ON r.id_reservation = i.id_reservation 
                    AND i.status = 'paid'
                INNER JOIN room_reservations rr ON r.id_reservation = rr.id_reservation
                    AND rr.status IN ('reserved', 'checked_in', 'checked_out')  -- TAMBAH FILTER INI!
                GROUP BY u.id_user, u.username, u.email, u.role
            ),
            summary_stats AS (
                SELECT 
                    COUNT(DISTINCT id_user) as total_customers,
                    COALESCE(SUM(total_spent), 0) as total_revenue,
                    COALESCE(AVG(total_spent), 0) as avg_revenue_per_customer,
                    COALESCE(MAX(total_spent), 0) as highest_total_spending
                FROM user_spending
                WHERE total_spent > 0
            )
            SELECT 
                us.id_user,
                us.username,
                us.email,
                us.role,
                us.total_bookings,
                us.total_spent,
                us.last_booking_date,
                us.avg_booking_amount,
                ss.total_customers,
                ss.total_revenue,
                ss.avg_revenue_per_customer,
                ss.highest_total_spending
            FROM user_spending us
            CROSS JOIN summary_stats ss
            WHERE us.total_spent > 0
            ORDER BY us.total_spent DESC
            LIMIT 10
        `;
        
        // [REST OF CODE REMAINS THE SAME...]
        
    } catch (error) {
        console.error('❌ Fixed top spenders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database query error in top spenders analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
