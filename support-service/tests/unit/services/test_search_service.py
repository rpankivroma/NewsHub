import pytest
from app.routers.support import get_chats_list
from app.websocket.manager import manager as ws_manager
from tests.factories.chat_factory import ChatFactory
from tests.factories.user_factory import UserFactory

def test_search_by_name_and_email(db_session, main_db_session):
    """
    Verify searching by guest name/email and registered name/email.
    Also covers partial matching and case insensitivity.
    """
    # Create Guest Chat
    ChatFactory.create(db_session, guest_name="Gregory House", guest_email="greg@diagnostics.com", status="active")
    # Create Registered Chat
    user = UserFactory.create(main_db_session, email="lisa.cuddy@hospital.org", full_name="Lisa Cuddy")
    ChatFactory.create(db_session, user_id=user.id, status="active")

    # 1. Search by guest name (exact & casing test)
    res = get_chats_list(search="Gregory", db=db_session, main_db=main_db_session)
    assert len(res["chats"]) == 1
    assert res["chats"][0]["name"] == "Gregory House"

    # Case insensitive check
    res_casing = get_chats_list(search="house", db=db_session, main_db=main_db_session)
    assert len(res_casing["chats"]) == 1

    # 2. Search by registry email (partial match test)
    res_email = get_chats_list(search="cuddy@", db=db_session, main_db=main_db_session)
    assert len(res_email["chats"]) == 1
    assert res_email["chats"][0]["name"] == "Lisa Cuddy"

    # 3. No matches search
    res_none = get_chats_list(search="moriarty", db=db_session, main_db=main_db_session)
    assert len(res_none["chats"]) == 0


def test_filters_registered_vs_guest(db_session, main_db_session):
    """
    Verify filtering options for 'registered' (registered vs active, true vs false).
    """
    ChatFactory.create(db_session, guest_name="Guest A", guest_email="g1@test.com")
    
    usr = UserFactory.create(main_db_session, email="reg@test.com")
    ChatFactory.create(db_session, user_id=usr.id)

    # Registered Only filter
    res_reg = get_chats_list(registered="true", db=db_session, main_db=main_db_session)
    assert len(res_reg["chats"]) == 1
    assert res_reg["chats"][0]["is_registered"] is True

    # Guest Only filter
    res_guest = get_chats_list(registered="false", db=db_session, main_db=main_db_session)
    assert len(res_guest["chats"]) == 1
    assert res_guest["chats"][0]["is_registered"] is False


def test_filters_active_vs_inactive(db_session, main_db_session):
    """
    Verify status filtering options for 'active' vs 'inactive'.
    """
    ChatFactory.create(db_session, guest_name="Active Guest", guest_email="g1@test.com", status="active")
    ChatFactory.create(db_session, guest_name="Closed Guest", guest_email="g2@test.com", status="inactive")

    # Inactive Only filter
    res_inactive = get_chats_list(status="inactive", db=db_session, main_db=main_db_session)
    assert len(res_inactive["chats"]) == 1
    assert res_inactive["chats"][0]["status"] == "inactive"

    # Active Only filter
    res_active = get_chats_list(status="active", db=db_session, main_db=main_db_session)
    assert len(res_active["chats"]) == 1
    assert res_active["chats"][0]["status"] == "active"


def test_filters_online_vs_offline(db_session, main_db_session, monkeypatch):
    """
    Verify filtering by visitor online status.
    """
    chat_offline = ChatFactory.create(db_session, guest_name="Offline Guest")
    chat_online = ChatFactory.create(db_session, guest_name="Online Guest")

    # Patch ws_manager online state
    monkeypatch.setattr(ws_manager, "is_visitor_connected", lambda chat_id: chat_id == chat_online.id)

    # 1. Filter online
    res_online = get_chats_list(online="true", db=db_session, main_db=main_db_session)
    assert len(res_online["chats"]) == 1
    assert res_online["chats"][0]["name"] == "Online Guest"

    # 2. Filter offline
    res_offline = get_chats_list(online="false", db=db_session, main_db=main_db_session)
    assert len(res_offline["chats"]) == 1
    assert res_offline["chats"][0]["name"] == "Offline Guest"


def test_filters_pagination(db_session, main_db_session):
    """
    Verify paging controls: Page limits, offset, totals, and empty bounds.
    """
    # Create 25 chats to test limits
    for i in range(25):
        ChatFactory.create(db_session, guest_name=f"Guest {i:02d}", guest_email=f"guest{i}@test.com")

    # Page 1 (Expected count: 10)
    res_p1 = get_chats_list(page=1, db=db_session, main_db=main_db_session)
    assert len(res_p1["chats"]) == 10
    assert res_p1["total"] == 25
    assert res_p1["pages"] == 3

    # Page 3 (Expected count: 5)
    res_p3 = get_chats_list(page=3, db=db_session, main_db=main_db_session)
    assert len(res_p3["chats"]) == 5

    # Page 4 (Expected count: 0)
    res_p4 = get_chats_list(page=4, db=db_session, main_db=main_db_session)
    assert len(res_p4["chats"]) == 0
