from apscheduler.schedulers.background import BackgroundScheduler
from app.services.notification_service import NotificationService

def init_scheduler():
    """Initialize the scheduler for periodic tasks"""
    scheduler = BackgroundScheduler()
    
    # Check for overdue books and send notifications daily at 9 AM
    scheduler.add_job(
        NotificationService.check_overdue_books,
        'cron',
        hour=9,
        minute=0
    )
    
    # Check for upcoming due dates daily at 10 AM
    scheduler.add_job(
        NotificationService.check_upcoming_due_dates,
        'cron',
        hour=10,
        minute=0
    )
    
    # Check for low stock items every 4 hours
    scheduler.add_job(
        NotificationService.check_low_stock_items,
        'interval',
        hours=4
    )
    
    # Check for upcoming maintenance tasks daily at 8 AM
    scheduler.add_job(
        NotificationService.check_upcoming_maintenance,
        'cron',
        hour=8,
        minute=0
    )
    
    scheduler.start()
    return scheduler
